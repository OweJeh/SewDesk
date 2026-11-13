import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ArrowRight, AlertCircle, Check } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);
    const { error: regError } = await register(fullName.trim(), email.trim(), password);
    setIsLoading(false);

    if (regError) {
      setError(regError.message || 'Registration failed. Please try again.');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo showTagline size="lg" to="/" />
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#111111]">
          Start your digital tailoring workspace
        </h2>
        <p className="mt-2 text-xs text-[#777777]">
          First 100 customer records free. No credit card required.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] py-8 px-6 shadow-sm rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Full Name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kofi Mensah"
            />

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kofi@mensahbespoke.com"
            />

            <Input
              label="Create Password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              helperText="Must be at least 6 characters"
            />

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#777777] cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-black underline font-medium" target="_blank">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-black underline font-medium" target="_blank">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <Button
              type="submit"
              className="w-full mt-3"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account & Setup Studio
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5E5E5] text-center text-xs text-[#777777]">
            Already have a SewDesk account?{' '}
            <Link to="/login" className="font-semibold text-black hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

