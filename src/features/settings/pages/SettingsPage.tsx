import React, { useState, useEffect } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentBusiness, currentRole, updateBusiness } = useCurrentBusiness();
  const { profile, updateProfile } = useAuth();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states initialized from profile and currentBusiness
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [hasUserEditedName, setHasUserEditedName] = useState(false);

  const [businessName, setBusinessName] = useState(currentBusiness?.business_name || '');
  const [businessType, setBusinessType] = useState(currentBusiness?.business_type || '');
  const [contactEmail, setContactEmail] = useState(currentBusiness?.contact_email || '');
  const [phone, setPhone] = useState(currentBusiness?.phone || '');
  const [city, setCity] = useState(currentBusiness?.city || '');
  const [measurementUnit, setMeasurementUnit] = useState<'cm' | 'inch'>(
    currentBusiness?.default_measurement_unit || 'cm'
  );
  const [currency, setCurrency] = useState(currentBusiness?.default_currency || 'GHS');
  const [hasUserEditedBiz, setHasUserEditedBiz] = useState(false);

  const canEditWorkspace = currentRole === 'owner' || currentRole === 'admin';

  useEffect(() => {
    if (profile?.full_name && !hasUserEditedName) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name, hasUserEditedName]);

  useEffect(() => {
    if (currentBusiness && !hasUserEditedBiz) {
      setBusinessName(currentBusiness.business_name || '');
      setBusinessType(currentBusiness.business_type || '');
      setContactEmail(currentBusiness.contact_email || '');
      setPhone(currentBusiness.phone || '');
      setCity(currentBusiness.city || '');
      setMeasurementUnit(currentBusiness.default_measurement_unit || 'cm');
      setCurrency(currentBusiness.default_currency || 'GHS');
    }
  }, [currentBusiness, hasUserEditedBiz]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        throw new Error('Your profile name cannot be empty.');
      }

      // 1. Update personal profile (persists to Supabase, Dexie, and AuthContext)
      const { error: profileError } = await updateProfile({
        full_name: trimmedName,
      });
      if (profileError) throw profileError;

      // 2. Update workspace profile if user is owner/admin
      if (currentBusiness && canEditWorkspace) {
        const { error: bizError } = await updateBusiness({
          business_name: businessName.trim(),
          business_type: businessType.trim(),
          contact_email: contactEmail.trim(),
          phone: phone.trim(),
          city: city.trim(),
          default_measurement_unit: measurementUnit,
          default_currency: currency.trim() || 'GHS',
        });
        if (bizError) throw bizError;
      }

      setSavedSuccess(true);
      setHasUserEditedName(false);
      setHasUserEditedBiz(false);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update settings. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-black">Studio & Profile Settings</h1>
          <Badge variant="outline" className="text-[10px]">
            {currentRole?.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xs text-[#777777] mt-1">
          Configure workshop preferences, default measurement units, and contact details.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-xs text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>Settings successfully updated. Your new profile name is now active across your workspace.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Settings */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-black flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
            <Building2 className="w-4 h-4 text-neutral-500" />
            <span>Workspace Profile</span>
          </h3>

          <Input
            label="Studio Name"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setHasUserEditedBiz(true);
            }}
            disabled={!canEditWorkspace}
          />

          <Input
            label="Studio Type"
            value={businessType}
            onChange={(e) => {
              setBusinessType(e.target.value);
              setHasUserEditedBiz(true);
            }}
            disabled={!canEditWorkspace}
          />

          <Input
            label="Contact Email"
            type="email"
            value={contactEmail}
            onChange={(e) => {
              setContactEmail(e.target.value);
              setHasUserEditedBiz(true);
            }}
            disabled={!canEditWorkspace}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setHasUserEditedBiz(true);
            }}
            disabled={!canEditWorkspace}
          />

          <Input
            label="City & Location"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setHasUserEditedBiz(true);
            }}
            disabled={!canEditWorkspace}
          />
        </div>

        {/* User Profile & Defaults */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-black flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
            <User className="w-4 h-4 text-neutral-500" />
            <span>Your Personal Profile</span>
          </h3>

          <Input
            label="Your Name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setHasUserEditedName(true);
            }}
            placeholder="e.g. Master Kofi Mensah"
            required
            helperText="This name appears in your welcome message and studio records"
          />

          <Input
            label="Account Email"
            value={profile?.email || ''}
            disabled
            helperText="Linked to your login credentials"
          />

          <div className="pt-2">
            <label className="block text-xs font-medium text-neutral-800 mb-1.5">
              Default Measurement Unit
            </label>
            <select
              value={measurementUnit}
              onChange={(e) => {
                setMeasurementUnit(e.target.value as 'cm' | 'inch');
                setHasUserEditedBiz(true);
              }}
              disabled={!canEditWorkspace}
              className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3.5 py-2 text-sm text-[#111111] focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 transition-colors"
            >
              <option value="cm">Centimetres (cm)</option>
              <option value="inch">Inches (in)</option>
            </select>
          </div>

          <div>
            <Input
              label="Default Currency"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setHasUserEditedBiz(true);
              }}
              disabled={!canEditWorkspace}
              placeholder="e.g. GHS, USD, GBP, EUR"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
