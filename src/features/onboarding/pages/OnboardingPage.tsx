import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Building2, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { profile } = useAuth();
  const { createBusiness, userBusinesses, canCreateWorkspace } = useCurrentBusiness();
  const navigate = useNavigate();

  // If user already owns a workspace, enforce 1 workspace per email and redirect
  useEffect(() => {
    if (userBusinesses.length > 0 && !canCreateWorkspace) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [userBusinesses, canCreateWorkspace, navigate]);

  const [step, setStep] = useState<1 | 2>(1);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Bespoke Tailoring');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState(profile?.email || '');
  const [country, setCountry] = useState('Ghana');
  const [region, setRegion] = useState('Greater Accra');
  const [city, setCity] = useState('Accra');
  const [defaultCurrency, setDefaultCurrency] = useState('GHS');
  const [defaultUnit, setDefaultUnit] = useState<'cm' | 'inch'>('cm');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim()) {
      setError('Please provide your studio or business name.');
      return;
    }

    if (!phone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }

    if (!city.trim()) {
      setError('Please provide your workshop city/location.');
      return;
    }

    setIsLoading(true);
    const { business, error: createError } = await createBusiness({
      business_name: businessName.trim(),
      business_type: businessType,
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      contact_email: contactEmail.trim(),
      country,
      region: region.trim() || undefined,
      city: city.trim(),
      default_currency: defaultCurrency,
      default_measurement_unit: defaultUnit,
    });
    setIsLoading(false);

    if (createError) {
      setError(createError.message || 'Failed to create workspace.');
    } else if (business) {
      setStep(2); // Show welcome & guidance checklist
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Logo showTagline size="lg" to="/" />
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-black">
            {step === 1 ? 'Configure Your Tailoring Workspace' : 'Welcome to SewDesk!'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#777777]">
            {step === 1
              ? 'Set your tailoring studio details, measurement unit, and primary currency.'
              : 'Your digital tailoring workspace has been provisioned.'}
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                step >= 1 ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              1
            </span>
            <span className="text-xs font-medium text-black">Studio Setup</span>
          </div>
          <div className="w-10 h-0.5 bg-neutral-300" />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                step === 2 ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              2
            </span>
            <span className="text-xs font-medium text-neutral-500">Ready</span>
          </div>
        </div>

        {step === 1 ? (
          <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Studio / Business Name"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Savile Row Bespoke / Mensah Stitches"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1.5">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="Bespoke Tailoring">Bespoke Tailoring</option>
                    <option value="Fashion Studio">Fashion Studio</option>
                    <option value="Bridal & Haute Couture">Bridal & Haute Couture</option>
                    <option value="Seamstress Workshop">Seamstress Workshop</option>
                    <option value="Ready-to-Wear Atelier">Ready-to-Wear Atelier</option>
                    <option value="Traditional & Cultural Attire">Traditional & Cultural Attire</option>
                  </select>
                </div>

                <div>
                  <Input
                    label="Studio Phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 123 4567"
                  />
                </div>

                <div>
                  <Input
                    label="WhatsApp Business (Optional)"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+233 24 123 4567"
                  />
                </div>

                <div>
                  <Input
                    label="Studio Email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@mensahbespoke.com"
                  />
                </div>

                <div>
                  <Input
                    label="Country"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ghana"
                  />
                </div>

                <div>
                  <Input
                    label="City / Workshop Location"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Accra, Osu"
                  />
                </div>

                {/* Units and Currency */}
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1.5">
                    Default Measurement Unit
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDefaultUnit('cm')}
                      className={`h-11 rounded-md text-xs font-semibold border flex items-center justify-center transition-colors ${
                        defaultUnit === 'cm'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-700 border-[#E5E5E5] hover:bg-neutral-50'
                      }`}
                    >
                      Centimetres (cm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultUnit('inch')}
                      className={`h-11 rounded-md text-xs font-semibold border flex items-center justify-center transition-colors ${
                        defaultUnit === 'inch'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-700 border-[#E5E5E5] hover:bg-neutral-50'
                      }`}
                    >
                      Inches (in)
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    You can switch units per garment or measurement session anytime.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1.5">
                    Default Currency
                  </label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="GHS">GHS (Ghanaian Cedi - GH₵)</option>
                    <option value="USD">USD (US Dollar - $)</option>
                    <option value="GBP">GBP (British Pound - £)</option>
                    <option value="EUR">EUR (Euro - €)</option>
                    <option value="NGN">NGN (Nigerian Naira - ₦)</option>
                    <option value="KES">KES (Kenyan Shilling - KSh)</option>
                    <option value="ZAR">ZAR (South African Rand - R)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-600 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>Designated as Workspace Owner</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    1 business workspace per registered email account
                  </span>
                </div>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Studio Workspace
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Step 2: Welcome & Getting Started Checklist */
          <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-black">
                {businessName} is ready for business
              </h2>
              <p className="text-xs text-[#777777] mt-1 max-w-md mx-auto">
                Your tenant workspace has been isolated and your free 100-customer allowance is now active.
              </p>
            </div>

            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                Quick Start Checklist
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <strong>1. Register your first customer:</strong> Record body profile, phone, and optional contact details.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <strong>2. Record measurements:</strong> Use our signature interactive ruler picker or quick manual input.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <strong>3. Create an order:</strong> Link garment design, fabrics, expected date, and track status.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <strong>4. Invite your workshop staff:</strong> Add tailors, assistants, or accountants at zero per-seat cost.
                  </div>
                </li>
              </ul>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/app/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Enter Dashboard &rarr;
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

