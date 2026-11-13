import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLiveSupabase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    const { error: loginError } = await login(email, password);
    setIsLoading(false);

    if (loginError) {
      setError(loginError.message || 'Failed to sign in. Please check your credentials.');
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo showTagline size="lg" to="/" />
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#111111]">
          Sign in to your tailoring workspace
        </h2>
        <p className="mt-2 text-xs text-[#777777]">
          Or{' '}
          <Link to="/register" className="font-semibold text-black hover:underline">
            create a new studio account free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] py-8 px-6 shadow-sm rounded-xl sm:px-10">
          {!isLiveSupabase && (
            <div className="mb-6 p-3 bg-neutral-100 border border-neutral-200 rounded-md text-xs text-neutral-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <span>
                <strong>Offline / Local Dev Mode:</strong> Enter any email and password to instantly access or test your workspace. Live Supabase credentials can be plugged in anytime.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tailor@fashionstudio.com"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-neutral-800">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#777777] hover:text-black font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5E5E5] text-center text-xs text-[#777777]">
            Protected by enterprise multi-tenant isolation.
          </div>
        </div>
      </div>
    </div>
  );
};

