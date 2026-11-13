import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Loader2 } from 'lucide-react';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RequireBusiness: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userBusinesses, isLoading } = useCurrentBusiness();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] text-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Resolving Business Context...
          </p>
        </div>
      </div>
    );
  }

  if (userBusinesses.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
