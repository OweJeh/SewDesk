import React, { useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Building2, User, Globe, Shield, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentBusiness, currentRole } = useCurrentBusiness();
  const { profile } = useAuth();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
          <span>Settings successfully updated.</span>
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
            defaultValue={currentBusiness?.business_name || ''}
            disabled={currentRole !== 'owner'}
          />

          <Input
            label="Studio Type"
            defaultValue={currentBusiness?.business_type || ''}
            disabled={currentRole !== 'owner'}
          />

          <Input
            label="Contact Email"
            defaultValue={currentBusiness?.contact_email || ''}
            disabled={currentRole !== 'owner'}
          />

          <Input
            label="Phone Number"
            defaultValue={currentBusiness?.phone || ''}
            disabled={currentRole !== 'owner'}
          />

          <Input
            label="City & Location"
            defaultValue={currentBusiness?.city || ''}
            disabled={currentRole !== 'owner'}
          />
        </div>

        {/* User Profile & Defaults */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-black flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
            <User className="w-4 h-4 text-neutral-500" />
            <span>Your Personal Profile</span>
          </h3>

          <Input label="Your Name" defaultValue={profile?.full_name || ''} />
          <Input label="Account Email" defaultValue={profile?.email || ''} disabled />

          <div className="pt-2">
            <label className="block text-xs font-medium text-neutral-800 mb-1.5">
              Default Measurement Unit
            </label>
            <Input
              defaultValue={
                currentBusiness?.default_measurement_unit === 'cm' ? 'Centimetres (cm)' : 'Inches (in)'
              }
              disabled
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-800 mb-1.5">
              Default Currency
            </label>
            <Input defaultValue={currentBusiness?.default_currency || 'GHS'} disabled />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" size="sm" leftIcon={<Save className="w-4 h-4" />}>
              Save Preferences
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
