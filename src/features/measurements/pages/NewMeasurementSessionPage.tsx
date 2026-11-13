import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { customerService } from '@/features/customers/services/customerService';
import { measurementService } from '@/features/measurements/services/measurementService';
import { STANDARD_TEMPLATES, type MeasurementFieldDef } from '@/features/measurements/data/templates';
import { InteractiveRulerPicker } from '@/features/measurements/components/InteractiveRulerPicker';
import type { Customer, MeasurementUnit } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Ruler,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  LayoutGrid,
} from 'lucide-react';

export const NewMeasurementSessionPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const customerIdParam = searchParams.get('customerId');
  const templateIdParam = searchParams.get('templateId') || 'male_bespoke';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerIdParam || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templateIdParam);
  const [unit, setUnit] = useState<MeasurementUnit>(
    currentBusiness?.default_measurement_unit || 'cm'
  );
  const [garmentType, setGarmentType] = useState('Bespoke Ensemble');
  const [sessionName, setSessionName] = useState(
    `Body Fitting — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  );
  const [fitNotes, setFitNotes] = useState('');

  // Values map: field_name -> current display value
  const [fieldValues, setFieldValues] = useState<Record<string, number>>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'ruler' | 'grid'>('ruler');

  const [isSaving, setIsSaving] = useState(false);
  const [autosavedTime, setAutosavedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active template
  const currentTemplate =
    STANDARD_TEMPLATES.find((t) => t.id === selectedTemplateId) || STANDARD_TEMPLATES[0];
  const fields = currentTemplate.fields;
  const activeField: MeasurementFieldDef = fields[currentFieldIndex] || fields[0];

  // Load customer list
  useEffect(() => {
    if (currentBusiness) {
      customerService.getCustomers(currentBusiness.id).then((list) => {
        setCustomers(list);
        if (!selectedCustomerId && list.length > 0) {
          setSelectedCustomerId(list[0].id);
        }
      });
    }
  }, [currentBusiness]);

  // Initialize field values from template typical values or draft
  useEffect(() => {
    if (!selectedCustomerId) return;

    // Check for draft
    const draft = measurementService.getDraft(selectedCustomerId);
    if (draft && draft.garmentType === garmentType) {
      setFieldValues(draft.values);
      setUnit(draft.unit);
      setFitNotes(draft.fitNotes);
      setAutosavedTime(new Date(draft.lastSaved).toLocaleTimeString());
      return;
    }

    // Default initialization
    const initial: Record<string, number> = {};
    fields.forEach((f) => {
      let defaultCm = 0;
      if (currentTemplate.profileType === 'Male') defaultCm = f.typicalMaleCm || 50;
      else if (currentTemplate.profileType === 'Female') defaultCm = f.typicalFemaleCm || 45;
      else if (currentTemplate.profileType === 'Children') defaultCm = f.typicalChildCm || 35;
      else defaultCm = f.minCm + (f.maxCm - f.minCm) * 0.4;

      initial[f.name] = unit === 'cm' ? +defaultCm.toFixed(1) : +(defaultCm / 2.54).toFixed(1);
    });

    setFieldValues(initial);
  }, [selectedTemplateId, selectedCustomerId]);

  // Autosave whenever values change
  const handleValueChange = (newVal: number) => {
    const updated = { ...fieldValues, [activeField.name]: newVal };
    setFieldValues(updated);

    if (selectedCustomerId) {
      measurementService.saveDraft(selectedCustomerId, {
        customerId: selectedCustomerId,
        garmentType,
        sessionName,
        fitNotes,
        unit,
        values: updated,
      });
      setAutosavedTime(new Date().toLocaleTimeString());
    }
  };

  // Unit switch conversion
  const handleUnitSwitch = (newUnit: MeasurementUnit) => {
    if (newUnit === unit) return;
    const converted: Record<string, number> = {};
    Object.entries(fieldValues).forEach(([k, val]) => {
      if (newUnit === 'inch') {
        converted[k] = +(val / 2.54).toFixed(1);
      } else {
        converted[k] = +(val * 2.54).toFixed(1);
      }
    });
    setUnit(newUnit);
    setFieldValues(converted);
  };

  // Submit and finalize session
  const handleFinalSave = async () => {
    if (!currentBusiness || !user || !selectedCustomerId) {
      setError('Please select a customer for this measurement set.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const recordedPayload = fields.map((f) => {
      const displayVal = fieldValues[f.name] || 0;
      const canonicalCm = unit === 'cm' ? displayVal : +(displayVal * 2.54).toFixed(2);
      return {
        field_name: f.name,
        original_value: displayVal,
        original_unit: unit,
        canonical_cm_value: canonicalCm,
      };
    });

    const { set, error: saveErr } = await measurementService.saveMeasurementSet({
      business_id: currentBusiness.id,
      customer_id: selectedCustomerId,
      template_id: currentTemplate.id,
      garment_type: garmentType,
      session_name: sessionName,
      fit_notes: fitNotes,
      recorded_by: user.id,
      values: recordedPayload,
    });

    setIsSaving(false);

    if (saveErr) {
      setError(saveErr.message);
    } else if (set) {
      // Record Activity
      await customerService.recordCustomerActivity({
        business_id: currentBusiness.id,
        customer_id: selectedCustomerId,
        activity_type: 'measurement_recorded',
        description: `Measurement session recorded: ${sessionName} (${fields.length} points)`,
        created_by: user.id,
      });

      navigate(`/app/customers/${selectedCustomerId}`);
    }
  };

  const activeValue = fieldValues[activeField?.name] || 50.0;

  return (
    <div className="space-y-6">
      {/* Top Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 border border-[#E5E5E5] rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black">
              New Body Fitting Session
            </h1>
            <p className="text-xs text-[#777777] mt-0.5">
              Record precision dimensions using the interactive ruler. Previous sets will never be overwritten.
            </p>
          </div>
        </div>

        {/* Mode Switch & Unit Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-1">
            <button
              onClick={() => handleUnitSwitch('cm')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                unit === 'cm' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
              }`}
            >
              cm
            </button>
            <button
              onClick={() => handleUnitSwitch('inch')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                unit === 'inch' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
              }`}
            >
              inches
            </button>
          </div>

          <div className="flex items-center bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-1">
            <button
              onClick={() => setViewMode('ruler')}
              className={`p-1.5 rounded-md ${
                viewMode === 'ruler' ? 'bg-black text-white' : 'text-neutral-600'
              }`}
              title="Interactive Ruler View"
            >
              <Ruler className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-black text-white' : 'text-neutral-600'
              }`}
              title="Rapid Grid Entry View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Session Metadata Controls Bar */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-800 mb-1.5">
            Select Client
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-xs text-[#111111] focus:border-black focus:outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.customer_number})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-800 mb-1.5">
            Measurement Template
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value);
              setCurrentFieldIndex(0);
            }}
            className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-xs text-[#111111] focus:border-black focus:outline-none"
          >
            {STANDARD_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.fields.length} pts)
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Garment Type / Purpose"
            value={garmentType}
            onChange={(e) => setGarmentType(e.target.value)}
            placeholder="e.g. 3-Piece Bespoke Suit"
          />
        </div>
      </div>

      {/* Main Interactive Studio Body */}
      {viewMode === 'ruler' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InteractiveRulerPicker
              measurementName={activeField.name}
              description={activeField.description}
              category={activeField.category}
              value={activeValue}
              unit={unit}
              min={unit === 'cm' ? activeField.minCm : +(activeField.minCm / 2.54).toFixed(1)}
              max={unit === 'cm' ? activeField.maxCm : +(activeField.maxCm / 2.54).toFixed(1)}
              onValueChange={handleValueChange}
              currentIndex={currentFieldIndex}
              totalCount={fields.length}
              onNext={() => {
                if (currentFieldIndex < fields.length - 1) {
                  setCurrentFieldIndex((i) => i + 1);
                }
              }}
              onPrev={() => {
                if (currentFieldIndex > 0) {
                  setCurrentFieldIndex((i) => i - 1);
                }
              }}
              onSkip={() => {
                if (currentFieldIndex < fields.length - 1) {
                  setCurrentFieldIndex((i) => i + 1);
                }
              }}
              onDone={handleFinalSave}
            />
          </div>

          {/* Right Column: Complete Set Overview & Autosave Status */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-neutral-500" />
                  <span>Session Points</span>
                </h3>
                {autosavedTime && (
                  <span className="text-[10px] text-green-700 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    Saved {autosavedTime}
                  </span>
                )}
              </div>

              <div className="space-y-1 mt-3 max-h-[380px] overflow-y-auto pr-1">
                {fields.map((f, idx) => {
                  const isSelected = idx === currentFieldIndex;
                  const val = fieldValues[f.name] || 0;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCurrentFieldIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'border-black bg-black text-white font-semibold'
                          : 'border-[#E5E5E5] bg-[#FAFAFA] hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <span className="truncate pr-2">{f.name}</span>
                      <span className="font-mono font-bold shrink-0">
                        {val.toFixed(1)} {unit}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Fit Notes */}
              <div className="mt-4 pt-3 border-t border-[#E5E5E5]">
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  Tailor Fit Notes & Posture Observations
                </label>
                <textarea
                  value={fitNotes}
                  onChange={(e) => setFitNotes(e.target.value)}
                  placeholder="e.g. Low left shoulder, prefers extra ease around seat and waist..."
                  rows={3}
                  className="w-full text-xs p-2.5 border border-[#E5E5E5] rounded-md focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              isLoading={isSaving}
              onClick={handleFinalSave}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Finalize & Save Session
            </Button>
          </div>
        </div>
      ) : (
        /* Rapid Grid Entry Mode */
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                Rapid Grid Entry Mode ({unit})
              </h3>
              <p className="text-xs text-[#777777] mt-0.5">
                Type directly into numeric inputs for fast batch dimension recording.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fields.map((f) => {
              const val = fieldValues[f.name] || 0;
              return (
                <div key={f.id} className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black truncate pr-1">{f.name}</span>
                    <span className="text-[10px] uppercase font-mono text-neutral-400">{unit}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={val}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) {
                        setFieldValues((prev) => ({ ...prev, [f.name]: num }));
                      }
                    }}
                    className="w-full text-center text-sm font-mono font-bold py-1.5 bg-white border border-[#E5E5E5] rounded focus:outline-none focus:border-black"
                  />
                  <p className="text-[9px] text-neutral-400 truncate">{f.description}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E5E5E5] flex justify-end">
            <Button size="lg" isLoading={isSaving} onClick={handleFinalSave} leftIcon={<Save className="w-4 h-4" />}>
              Finalize & Save Session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

