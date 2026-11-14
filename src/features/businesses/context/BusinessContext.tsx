import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { db } from '@/offline/database/dexie-db';
import { useAuth } from '@/features/auth/context/AuthContext';
import { generateUUID } from '@/lib/utils';
import type { Business, BusinessMember, BusinessInvitation, BusinessRole } from '@/types';

interface CreateBusinessInput {
  business_name: string;
  business_type: string;
  phone: string;
  whatsapp?: string;
  contact_email: string;
  country: string;
  region?: string;
  city: string;
  default_currency: string;
  default_measurement_unit: 'cm' | 'inch';
}

interface BusinessContextType {
  currentBusiness: Business | null;
  currentRole: BusinessRole | null;
  userBusinesses: Business[];
  members: BusinessMember[];
  invitations: BusinessInvitation[];
  hasActiveSubscription: boolean;
  isLoading: boolean;
  switchBusiness: (businessId: string) => Promise<void>;
  createBusiness: (data: CreateBusinessInput) => Promise<{ business: Business | null; error: Error | null }>;
  updateBusiness: (updates: Partial<Business>) => Promise<{ error: Error | null }>;
  inviteStaff: (email: string, role: BusinessRole) => Promise<{ error: Error | null }>;
  cancelInvitation: (invitationId: string) => Promise<{ error: Error | null }>;
  refreshBusiness: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const ACTIVE_BUSINESS_KEY = 'sewdesk_active_business_id';

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [currentRole, setCurrentRole] = useState<BusinessRole | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([]);
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [invitations, setInvitations] = useState<BusinessInvitation[]>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isLive = isSupabaseConfigured();

  const loadBusinessDetails = useCallback(async (businessId: string, userId: string) => {
    try {
      if (isLive) {
        // Load business
        const { data: bData, error: bErr } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();

        if (bData && !bErr) {
          setCurrentBusiness(bData as Business);

          // Load user role in this business
          const { data: memberData } = await supabase
            .from('business_members')
            .select('*')
            .eq('business_id', businessId)
            .eq('profile_id', userId)
            .maybeSingle();

          if (memberData) {
            setCurrentRole(memberData.role as BusinessRole);
          } else if (bData.owner_profile_id === userId) {
            setCurrentRole('owner');
          }

          // Load all members
          const { data: allMembers } = await supabase
            .from('business_members')
            .select('*, profile:profiles(*)')
            .eq('business_id', businessId);

          if (allMembers) {
            setMembers(allMembers as BusinessMember[]);
          }

          // Load invitations
          const { data: allInvites } = await supabase
            .from('business_invitations')
            .select('*')
            .eq('business_id', businessId)
            .is('accepted_at', null);

          if (allInvites) {
            setInvitations(allInvites as BusinessInvitation[]);
          }

          // Check subscription status
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('id, status')
            .eq('business_id', businessId)
            .eq('status', 'active')
            .maybeSingle();

          setHasActiveSubscription(Boolean(subData));
          return;
        }
      }

      // Offline / Local fallback
      const localB = await db.businesses.get(businessId);
      if (localB) {
        setCurrentBusiness(localB);
        const myMember = await db.businessMembers
          .where({ business_id: businessId, profile_id: userId })
          .first();

        if (myMember) {
          setCurrentRole(myMember.role);
        } else if (localB.owner_profile_id === userId) {
          setCurrentRole('owner');
        }

        const bMembers = await db.businessMembers.where('business_id').equals(businessId).toArray();
        // Hydrate profiles for members
        const hydratedMembers = await Promise.all(
          bMembers.map(async (m) => {
            const p = await db.profiles.get(m.profile_id);
            return { ...m, profile: p };
          })
        );
        setMembers(hydratedMembers);

        const bInvites = await db.businessInvitations.where('business_id').equals(businessId).toArray();
        setInvitations(bInvites.filter((inv) => !inv.accepted_at));
      }
    } catch (err) {
      console.error('Error loading business details:', err);
    }
  }, [isLive]);

  const loadUserBusinesses = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      let businessesList: Business[] = [];

      if (isLive) {
        // Find businesses where user is member or owner
        const { data: memberRecords } = await supabase
          .from('business_members')
          .select('business_id')
          .eq('profile_id', userId);

        const memberBusinessIds = memberRecords?.map((m) => m.business_id) || [];

        const { data: ownedBusinesses } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_profile_id', userId);

        const ownedIds = ownedBusinesses?.map((b) => b.id) || [];
        const allIds = Array.from(new Set([...memberBusinessIds, ...ownedIds]));

        if (allIds.length > 0) {
          const { data: bData } = await supabase
            .from('businesses')
            .select('*')
            .in('id', allIds)
            .is('archived_at', null);

          if (bData) {
            businessesList = bData as Business[];
          }
        }
      } else {
        // Offline / Local
        const localOwned = await db.businesses
          .where('owner_profile_id')
          .equals(userId)
          .toArray();

        const localMembers = await db.businessMembers
          .where('profile_id')
          .equals(userId)
          .toArray();

        const memberBusinessIds = localMembers.map((m) => m.business_id);
        const otherBusinesses = await db.businesses
          .where('id')
          .anyOf(memberBusinessIds)
          .toArray();

        const combined = [...localOwned, ...otherBusinesses];
        // Deduplicate
        const uniqueMap = new Map<string, Business>();
        combined.forEach((b) => uniqueMap.set(b.id, b));
        businessesList = Array.from(uniqueMap.values());
      }

      setUserBusinesses(businessesList);

      // Select active business
      if (businessesList.length > 0) {
        const storedActiveId = localStorage.getItem(ACTIVE_BUSINESS_KEY);
        const target = businessesList.find((b) => b.id === storedActiveId) || businessesList[0];
        localStorage.setItem(ACTIVE_BUSINESS_KEY, target.id);
        await loadBusinessDetails(target.id, userId);
      } else {
        setCurrentBusiness(null);
        setCurrentRole(null);
        setMembers([]);
        setInvitations([]);
      }
    } catch (err) {
      console.error('Error fetching user businesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLive, loadBusinessDetails]);

  useEffect(() => {
    if (user?.id) {
      loadUserBusinesses(user.id);
    } else {
      setCurrentBusiness(null);
      setCurrentRole(null);
      setUserBusinesses([]);
      setMembers([]);
      setInvitations([]);
      setIsLoading(false);
    }
  }, [user?.id, loadUserBusinesses]);

  const switchBusiness = async (businessId: string) => {
    if (!user) return;
    localStorage.setItem(ACTIVE_BUSINESS_KEY, businessId);
    await loadBusinessDetails(businessId, user.id);
  };

  const createBusiness = async (
    data: CreateBusinessInput
  ): Promise<{ business: Business | null; error: Error | null }> => {
    if (!user || !profile) {
      return { business: null, error: new Error('User must be authenticated') };
    }

    try {
      const newBusinessId = generateUUID();
      const now = new Date().toISOString();

      const newBusiness: Business = {
        id: newBusinessId,
        business_name: data.business_name,
        business_type: data.business_type,
        owner_profile_id: user.id,
        contact_email: data.contact_email,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        country: data.country,
        region: data.region || null,
        city: data.city,
        logo_url: null,
        default_currency: data.default_currency || 'GHS',
        default_measurement_unit: data.default_measurement_unit || 'cm',
        customer_slots_used: 0,
        created_at: now,
        updated_at: now,
        archived_at: null,
      };

      const ownerMember: BusinessMember = {
        id: generateUUID(),
        business_id: newBusinessId,
        profile_id: user.id,
        role: 'owner',
        invitation_status: 'active',
        joined_at: now,
        created_at: now,
        profile: profile,
      };

      if (isLive) {
        // Defensive guard: ensure the profiles row exists before inserting businesses
        // (FK: businesses.owner_profile_id → profiles.id).
        // The auth trigger should have created it, but email-confirmation flows
        // may delay the trigger until after the session is established.
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          const { error: profileUpsertError } = await supabase.from('profiles').upsert(
            {
              id: user.id,
              full_name: profile?.full_name || user.email?.split('@')[0] || 'Owner',
              email: user.email || data.contact_email,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
          if (profileUpsertError) {
            console.warn('Defensive profile upsert failed:', profileUpsertError.message);
            // Proceed anyway — the row may exist and RLS just blocked the check.
          }
        }

        const { error: bError } = await supabase.from('businesses').insert(newBusiness);
        if (bError) throw bError;

        const { error: mError } = await supabase.from('business_members').insert({
          id: ownerMember.id,
          business_id: newBusinessId,
          profile_id: user.id,
          role: 'owner',
          invitation_status: 'active',
        });
        if (mError) throw mError;
      }

      // Also save to Dexie DB
      await db.businesses.put(newBusiness);
      await db.businessMembers.put(ownerMember);

      // Update state
      localStorage.setItem(ACTIVE_BUSINESS_KEY, newBusiness.id);
      setCurrentBusiness(newBusiness);
      setCurrentRole('owner');
      setUserBusinesses((prev) => [newBusiness, ...prev]);
      setMembers([ownerMember]);

      return { business: newBusiness, error: null };
    } catch (err) {
      return { business: null, error: err as Error };
    }
  };

  const inviteStaff = async (email: string, role: BusinessRole): Promise<{ error: Error | null }> => {
    if (!currentBusiness || !user) {
      return { error: new Error('No active business selected.') };
    }

    try {
      // Free plan limit: up to 3 invited staff members (non-owner members + pending invitations)
      let activeSub = hasActiveSubscription;
      if (isLive && !activeSub) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('business_id', currentBusiness.id)
          .eq('status', 'active')
          .maybeSingle();
        activeSub = Boolean(subData);
      }

      const invitedStaffCount = members.filter((m) => m.role !== 'owner').length + invitations.length;
      if (!activeSub && invitedStaffCount >= 3) {
        return {
          error: new Error(
            'STAFF_LIMIT_EXCEEDED: Free plan includes up to 3 invited staff members. Upgrade to Pro Studio for unlimited team members.'
          ),
        };
      }

      const token = generateUUID();
      const newInvite: BusinessInvitation = {
        id: generateUUID(),
        business_id: currentBusiness.id,
        invited_email: email.trim().toLowerCase(),
        role,
        invitation_token_hash: token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: null,
        invited_by: user.id,
        created_at: new Date().toISOString(),
      };

      if (isLive) {
        const { error } = await supabase.from('business_invitations').insert(newInvite);
        if (error) throw error;
      }

      await db.businessInvitations.put(newInvite);
      setInvitations((prev) => [newInvite, ...prev]);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const cancelInvitation = async (invitationId: string): Promise<{ error: Error | null }> => {
    try {
      if (isLive) {
        const { error } = await supabase
          .from('business_invitations')
          .delete()
          .eq('id', invitationId);
        if (error) throw error;
      }

      await db.businessInvitations.delete(invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const refreshBusiness = async () => {
    if (currentBusiness && user) {
      await loadBusinessDetails(currentBusiness.id, user.id);
    }
  };

  const updateBusiness = async (updates: Partial<Business>): Promise<{ error: Error | null }> => {
    if (!currentBusiness) {
      return { error: new Error('No active business selected.') };
    }

    try {
      const updatedBusiness: Business = {
        ...currentBusiness,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (isLive) {
        const { error: bErr } = await supabase
          .from('businesses')
          .update(updates)
          .eq('id', currentBusiness.id);

        if (bErr) throw bErr;
      }

      await db.businesses.put(updatedBusiness);

      setCurrentBusiness(updatedBusiness);
      setUserBusinesses((prev) =>
        prev.map((b) => (b.id === updatedBusiness.id ? updatedBusiness : b))
      );

      return { error: null };
    } catch (err) {
      console.error('Error updating business:', err);
      return { error: err as Error };
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        currentBusiness,
        currentRole,
        userBusinesses,
        members,
        invitations,
        hasActiveSubscription,
        isLoading,
        switchBusiness,
        createBusiness,
        updateBusiness,
        inviteStaff,
        cancelInvitation,
        refreshBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useCurrentBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useCurrentBusiness must be used within a BusinessProvider');
  }
  return context;
};

