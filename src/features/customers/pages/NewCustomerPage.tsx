import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { customerService } from '@/features/customers/services/customerService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, UserPlus, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export const NewCustomerPage: React.FC = () => {
  const { currentBusiness, refreshBusiness } = useCurrentBusiness();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [measurementProfile, setMeasurementProfile] = useState('Male Bespoke');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slotsUsed = currentBusiness?.customer_slots_used ?? 0;
  const isAllowanceExceeded = slotsUsed >= 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness || !user) return;
    setError(null);

    if (isAllowanceExceeded) {
      setError(
        'Free customer allowance limit (100) reached. An active paid subscription (GHS 150/mo) is required to register customer #101.'
      );
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      setError('Full Name and Phone Number are required fields.');
      return;
    }

    setIsLoading(true);
    const { customer, error: createErr } = await customerService.createCustomer({
      business_id: currentBusiness.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() || undefined,
      measurement_profile: measurementProfile,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      created_by: user.id,
    });
    setIsLoading(false);

    if (createErr) {
      setError(createErr.message);
    } else if (customer) {
      await refreshBusiness();
      navigate(`/app/customers/${customer.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/app/customers')}
          className="p-2 border border-[#E5E5E5] rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-black" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Register New Customer
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Add client anatomical profile and contact details to studio registry.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Client Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Nana Kwame Addo"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Primary Phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 24 123 4567"
            />
            <Input
              label="WhatsApp (Optional)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+233 24 123 4567"
            />
          </div>

          <Input
            label="Email Address (Optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@domain.com"
          />

          <div>
            <label className="block text-xs font-medium text-neutral-800 mb-1.5">
              Measurement Profile Category
            </label>
            <select
              value={measurementProfile}
              onChange={(e) => setMeasurementProfile(e.target.value)}
              className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-xs text-[#111111] focus:border-black focus:outline-none"
            >
              <option value="Male Bespoke">Male Bespoke (Suits, Kaftans, Shirts, Trousers)</option>
              <option value="Female Bespoke">Female Bespoke (Gowns, Kaba & Slit, Corsets)</option>
              <option value="Children">Children’s Formalwear</option>
              <option value="Standard Unisex">Standard Unisex Profile</option>
            </select>
          </div>

          <Input
            label="Location / Delivery Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Airport Residential Area, Accra"
          />

          <div>
            <label className="block text-xs font-medium text-neutral-800 mb-1.5">
              General Customer Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Prefers slim fit, frequent traveller, prefers high-twist wool..."
              rows={3}
              className="w-full text-xs p-3 border border-[#E5E5E5] rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-mono">
              Slots: {slotsUsed} / 100 free
            </span>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/app/customers')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isLoading}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Save & Open Profile
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

