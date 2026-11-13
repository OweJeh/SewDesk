import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { customerService, type CustomerNoteItem, type CustomerActivityItem } from '@/features/customers/services/customerService';
import { measurementService } from '@/features/measurements/services/measurementService';
import { MeasurementComparisonModal } from '@/features/measurements/components/MeasurementComparisonModal';
import type { Customer, MeasurementSet, MeasurementUnit } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  Ruler,
  Scissors,
  CreditCard,
  FileText,
  Activity,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  History,
  Copy,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentBusiness } = useCurrentBusiness();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'orders' | 'payments' | 'notes' | 'activity'>('overview');
  const [measurementSets, setMeasurementSets] = useState<MeasurementSet[]>([]);
  const [notes, setNotes] = useState<CustomerNoteItem[]>([]);
  const [activities, setActivities] = useState<CustomerActivityItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Comparison State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedSetA, setSelectedSetA] = useState<MeasurementSet | null>(null);
  const [selectedSetB, setSelectedSetB] = useState<MeasurementSet | null>(null);

  // Selected session to inspect values
  const [inspectedSet, setInspectedSet] = useState<MeasurementSet | null>(null);
  const [inspectUnit, setInspectUnit] = useState<MeasurementUnit>('cm');

  const currency = currentBusiness?.default_currency || 'GHS';

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    Promise.all([
      customerService.getCustomerById(id),
      measurementService.getCustomerMeasurementSets(id),
      customerService.getCustomerNotes(id),
      customerService.getCustomerActivity(id),
    ]).then(([cust, sets, noteList, actList]) => {
      setCustomer(cust);
      setMeasurementSets(sets);
      if (sets.length > 0) {
        setInspectedSet(sets[0]);
      }
      setNotes(noteList);
      setActivities(actList);
      setIsLoading(false);
    });
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !customer || !user) return;

    const added = await customerService.addCustomerNote(
      customer.business_id,
      customer.id,
      user.id,
      newNoteText.trim(),
      profile?.full_name || 'Staff'
    );
    setNotes((prev) => [added, ...prev]);
    setNewNoteText('');

    // Reload activity
    const updatedActs = await customerService.getCustomerActivity(customer.id);
    setActivities(updatedActs);
  };

  const handleOpenComparison = (setA: MeasurementSet, setB: MeasurementSet) => {
    setSelectedSetA(setA);
    setSelectedSetB(setB);
    setCompareModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Loading client profile...
        </p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center space-y-4">
        <h3 className="text-base font-bold text-black">Customer Not Found</h3>
        <p className="text-xs text-[#777777]">The requested client record does not exist or has been removed.</p>
        <Link to="/app/customers">
          <Button size="sm">Back to Customer Directory</Button>
        </Link>
      </div>
    );
  }

  const latestSet = measurementSets[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/app/customers')}
              className="p-2 border border-[#E5E5E5] rounded-lg hover:bg-neutral-50 transition-colors mt-1"
            >
              <ArrowLeft className="w-4 h-4 text-black" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-black">{customer.full_name}</h1>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {customer.customer_number}
                </Badge>
                {customer.measurement_profile && (
                  <Badge variant="secondary" className="text-[10px]">
                    {customer.measurement_profile}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 mt-2">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{customer.phone}</span>
                </div>
                {customer.whatsapp && (
                  <div className="flex items-center gap-1.5 text-green-700">
                    <span>WA: {customer.whatsapp}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.location && (
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{customer.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/app/measurements/new?customerId=${customer.id}`}>
              <Button size="sm" leftIcon={<Ruler className="w-3.5 h-3.5" />}>
                Record Measurement
              </Button>
            </Link>
            <Link to={`/app/orders?customerId=${customer.id}`}>
              <Button size="sm" variant="outline" leftIcon={<Scissors className="w-3.5 h-3.5" />}>
                New Order
              </Button>
            </Link>
          </div>
        </div>

        {/* 6 Tab Headers */}
        <div className="flex items-center gap-1 border-t border-[#E5E5E5] pt-4 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'measurements', label: `Measurements (${measurementSets.length})`, icon: Ruler },
            { id: 'orders', label: 'Orders (0)', icon: Scissors },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'notes', label: `Notes (${notes.length})`, icon: FileText },
            { id: 'activity', label: `Activity (${activities.length})`, icon: Activity },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-black text-white font-semibold shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-[#777777]">Total Orders</span>
              <div className="text-2xl font-bold font-mono text-black mt-1">0</div>
              <p className="text-[10px] text-neutral-400 mt-1">Bespoke garments</p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-[#777777]">Total Spent</span>
              <div className="text-2xl font-bold font-mono text-black mt-1">
                {formatCurrency(0, currency)}
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">Lifetime client revenue</p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-[#777777]">Balance Due</span>
              <div className="text-2xl font-bold font-mono text-green-700 mt-1">
                {formatCurrency(0, currency)}
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">All accounts settled</p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-[#777777]">Registered Date</span>
              <div className="text-sm font-bold text-black mt-2 font-mono">
                {formatDate(customer.created_at)}
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">Direct workshop client</p>
            </div>
          </div>

          {/* Latest Measurement Preview Card */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-black" />
                <h3 className="text-sm font-bold text-black">Latest Measurement Session</h3>
              </div>
              {latestSet ? (
                <button
                  onClick={() => setActiveTab('measurements')}
                  className="text-xs font-semibold text-black hover:underline flex items-center gap-1"
                >
                  View all {measurementSets.length} sets &rarr;
                </button>
              ) : (
                <Link to={`/app/measurements/new?customerId=${customer.id}`}>
                  <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Record First Measurements
                  </Button>
                </Link>
              )}
            </div>

            {latestSet ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-black text-sm">{latestSet.session_name}</span>
                    <span className="text-neutral-400 ml-2">({latestSet.garment_type})</span>
                  </div>
                  <span className="text-neutral-400 font-mono text-[11px]">
                    Recorded: {formatDate(latestSet.created_at)}
                  </span>
                </div>

                {latestSet.fit_notes && (
                  <p className="text-xs text-neutral-600 bg-[#FAFAFA] p-3 rounded-lg border border-[#E5E5E5]">
                    <strong>Fit Notes:</strong> {latestSet.fit_notes}
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  {latestSet.values?.slice(0, 8).map((v) => (
                    <div key={v.id} className="p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                      <span className="text-[10px] uppercase font-semibold text-[#777777] block truncate">
                        {v.field_name}
                      </span>
                      <span className="text-sm font-bold font-mono text-black mt-0.5 block">
                        {v.canonical_cm_value} cm
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">
                No measurements captured for this client yet. Use the interactive ruler picker to record a full body fitting session.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MEASUREMENTS & SESSIONS HISTORY */}
      {activeTab === 'measurements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
            <div>
              <h3 className="text-base font-bold text-black">Historical Measurement Sessions</h3>
              <p className="text-xs text-[#777777] mt-0.5">
                Each session is an immutable record. Earlier measurements are preserved to track anatomical changes over time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {measurementSets.length >= 2 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenComparison(measurementSets[1], measurementSets[0])}
                  leftIcon={<History className="w-3.5 h-3.5" />}
                >
                  Compare Last 2 Sessions
                </Button>
              )}
              <Link to={`/app/measurements/new?customerId=${customer.id}`}>
                <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  New Measurement Session
                </Button>
              </Link>
            </div>
          </div>

          {measurementSets.length === 0 ? (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center space-y-4">
              <Ruler className="w-8 h-8 mx-auto text-neutral-400" />
              <h4 className="text-sm font-bold text-black">No measurement sessions yet</h4>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">
                Record your client's first body measurements using our signature interactive ruler.
              </p>
              <Link to={`/app/measurements/new?customerId=${customer.id}`}>
                <Button size="sm">Start Measurement Session</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Session List */}
              <div className="space-y-3">
                {measurementSets.map((s, idx) => {
                  const isInspected = inspectedSet?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setInspectedSet(s)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isInspected
                          ? 'border-black bg-white shadow-md ring-1 ring-black'
                          : 'border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-black">{s.session_name}</span>
                        {idx === 0 && (
                          <Badge variant="default" className="text-[9px]">LATEST</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{s.garment_type}</p>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                        <span>{formatDate(s.created_at)}</span>
                        <span>{s.values?.length || 0} dimensions</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inspected Session Values Display */}
              <div className="lg:col-span-2 bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
                {inspectedSet && (
                  <>
                    <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-black">{inspectedSet.session_name}</h4>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {formatDate(inspectedSet.created_at)} &bull; {inspectedSet.garment_type}
                        </span>
                      </div>

                      {/* Display Unit Switcher */}
                      <div className="flex items-center bg-[#FAFAFA] border border-[#E5E5E5] rounded p-0.5 text-xs">
                        <button
                          onClick={() => setInspectUnit('cm')}
                          className={`px-2.5 py-1 rounded font-semibold ${
                            inspectUnit === 'cm' ? 'bg-black text-white' : 'text-neutral-600'
                          }`}
                        >
                          cm
                        </button>
                        <button
                          onClick={() => setInspectUnit('inch')}
                          className={`px-2.5 py-1 rounded font-semibold ${
                            inspectUnit === 'inch' ? 'bg-black text-white' : 'text-neutral-600'
                          }`}
                        >
                          inches
                        </button>
                      </div>
                    </div>

                    {inspectedSet.fit_notes && (
                      <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs text-neutral-700">
                        <strong>Fit & Posture Notes:</strong> {inspectedSet.fit_notes}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {inspectedSet.values?.map((v) => {
                        const displayVal =
                          inspectUnit === 'cm'
                            ? v.canonical_cm_value
                            : +(v.canonical_cm_value / 2.54).toFixed(1);

                        return (
                          <div
                            key={v.id}
                            className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg"
                          >
                            <span className="text-[10px] uppercase font-semibold text-[#777777] block truncate">
                              {v.field_name}
                            </span>
                            <span className="text-base font-bold font-mono text-black mt-1 block">
                              {displayVal} {inspectUnit}
                            </span>
                            <span className="text-[9px] text-neutral-400 block mt-0.5">
                              orig: {v.original_value} {v.original_unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center space-y-4 shadow-sm">
          <Scissors className="w-8 h-8 mx-auto text-neutral-400" />
          <h3 className="text-sm font-bold text-black">No Garment Orders for this Client</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto">
            Create an order linked to {customer.full_name}'s body measurements to track tailoring production.
          </p>
          <Link to={`/app/orders?customerId=${customer.id}`}>
            <Button size="sm">Create New Order</Button>
          </Link>
        </div>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center space-y-4 shadow-sm">
          <CreditCard className="w-8 h-8 mx-auto text-neutral-400" />
          <h3 className="text-sm font-bold text-black">No Transactions Recorded</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto">
            Payment records, deposits, and printable receipts for this customer will appear here.
          </p>
        </div>
      )}

      {/* TAB 5: NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-6">
          <form onSubmit={handleAddNote} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-black">
              Add Workshop Client Note
            </label>
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Record style preferences, fabric preferences, event dates, or fitting notes..."
              rows={3}
              className="w-full text-xs p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-black"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                Save Note
              </Button>
            </div>
          </form>

          <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Client Notes Log ({notes.length})
            </h4>
            {notes.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No notes added yet.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="font-semibold text-black">{n.author_name}</span>
                    <span className="font-mono">{formatDate(n.created_at)}</span>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">{n.note}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider">
            Chronological Interaction Timeline
          </h3>

          <div className="relative border-l border-[#E5E5E5] ml-4 pl-6 space-y-6">
            {activities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-black ring-4 ring-white" />
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span className="font-semibold uppercase tracking-wider text-black">
                    {act.activity_type.replace(/_/g, ' ')}
                  </span>
                  <span>{formatDate(act.created_at)}</span>
                </div>
                <p className="text-xs text-neutral-700 mt-1">{act.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {selectedSetA && selectedSetB && (
        <MeasurementComparisonModal
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          setA={selectedSetA}
          setB={selectedSetB}
          defaultUnit={currentBusiness?.default_measurement_unit || 'cm'}
        />
      )}
    </div>
  );
};
