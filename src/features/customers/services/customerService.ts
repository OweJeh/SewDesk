// ==============================================================================
// SEWDESK — CUSTOMER SERVICE & REPOSITORY LAYER
// ==============================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { db } from '@/offline/database/dexie-db';
import { generateUUID } from '@/lib/utils';
import type { Customer } from '@/types';

export interface CustomerNoteItem {
  id: string;
  business_id: string;
  customer_id: string;
  note: string;
  created_by: string;
  created_at: string;
  author_name?: string;
}

export interface CustomerActivityItem {
  id: string;
  business_id: string;
  customer_id: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

export interface CreateCustomerInput {
  business_id: string;
  full_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  measurement_profile?: string;
  location?: string;
  notes?: string;
  created_by: string;
}

export const customerService = {
  // Fetch customers for a business
  async getCustomers(businessId: string): Promise<Customer[]> {
    const isLive = isSupabaseConfigured();
    if (isLive) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('business_id', businessId)
          .is('archived_at', null)
          .order('created_at', { ascending: false });

        if (data && !error) {
          // Sync to Dexie
          for (const item of data) {
            await db.customers.put(item as Customer);
          }
          return data as Customer[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local database:', err);
      }
    }

    return db.customers
      .where('business_id')
      .equals(businessId)
      .filter((c) => !c.archived_at)
      .reverse()
      .sortBy('created_at');
  },

  // Fetch single customer by ID
  async getCustomerById(customerId: string): Promise<Customer | null> {
    const isLive = isSupabaseConfigured();
    if (isLive) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();

        if (data && !error) {
          await db.customers.put(data as Customer);
          return data as Customer;
        }
      } catch (err) {
        console.warn('Supabase getCustomerById failed, checking local:', err);
      }
    }

    const local = await db.customers.get(customerId);
    return local || null;
  },

  // Create Customer with Authoritative 100-limit enforcement
  async createCustomer(input: CreateCustomerInput): Promise<{ customer: Customer | null; error: Error | null }> {
    const isLive = isSupabaseConfigured();

    try {
      // 1. Fetch current business to read slots_used
      let currentSlots = 0;
      let hasActiveSub = false;

      if (isLive) {
        const { data: bData, error: bErr } = await supabase
          .from('businesses')
          .select('customer_slots_used')
          .eq('id', input.business_id)
          .single();

        if (bErr) throw bErr;
        currentSlots = bData?.customer_slots_used ?? 0;

        // Check subscription if slots >= 100
        if (currentSlots >= 100) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('business_id', input.business_id)
            .eq('status', 'active')
            .maybeSingle();

          hasActiveSub = Boolean(subData);
        }
      } else {
        const localBiz = await db.businesses.get(input.business_id);
        currentSlots = localBiz?.customer_slots_used ?? 0;
      }

      // Enforce the 100 free customer allowance
      if (currentSlots >= 100 && !hasActiveSub) {
        return {
          customer: null,
          error: new Error(
            'CUSTOMER_ALLOWANCE_EXCEEDED: Free allowance of 100 registered customers reached. An active paid subscription (GHS 150/mo) is required to register additional clients.'
          ),
        };
      }

      const nextSeq = currentSlots + 1;
      const customerNum = `CUST-${String(nextSeq).padStart(4, '0')}`;
      const now = new Date().toISOString();

      const newCustomer: Customer = {
        id: generateUUID(),
        business_id: input.business_id,
        customer_number: customerNum,
        full_name: input.full_name.trim(),
        phone: input.phone.trim(),
        whatsapp: input.whatsapp?.trim() || null,
        email: input.email?.trim() || null,
        measurement_profile: input.measurement_profile || 'Standard',
        location: input.location?.trim() || null,
        notes: input.notes?.trim() || null,
        created_by: input.created_by,
        created_at: now,
        updated_at: now,
        archived_at: null,
      };

      if (isLive) {
        let rpcCompleted = false;

        // 1. Try atomic database RPC (bypasses RLS via SECURITY DEFINER & enforces slot limits atomically)
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc('register_customer_atomic', {
            p_business_id: input.business_id,
            p_full_name: input.full_name.trim(),
            p_phone: input.phone.trim(),
            p_whatsapp: input.whatsapp?.trim() || null,
            p_email: input.email?.trim() || null,
            p_measurement_profile: input.measurement_profile || 'Standard',
            p_location: input.location?.trim() || null,
            p_notes: input.notes?.trim() || null,
          });

          if (!rpcErr && rpcData?.success) {
            newCustomer.id = rpcData.customer_id;
            newCustomer.customer_number = rpcData.customer_number;
            rpcCompleted = true;
          } else if (rpcErr && rpcErr.message?.includes('CUSTOMER_ALLOWANCE_EXCEEDED')) {
            throw rpcErr;
          }
        } catch (rpcEx: any) {
          if (rpcEx.message?.includes('CUSTOMER_ALLOWANCE_EXCEEDED')) {
            throw rpcEx;
          }
          // If RPC is unavailable or returns an error, gracefully proceed to direct insert
          console.warn('register_customer_atomic RPC not used, using direct insert:', rpcEx?.message || rpcEx);
        }

        // 2. Direct insert fallback (uses RLS INSERT policy)
        if (!rpcCompleted) {
          const { error: insErr } = await supabase.from('customers').insert(newCustomer);
          if (insErr) throw insErr;

          await supabase
            .from('businesses')
            .update({ customer_slots_used: nextSeq, updated_at: now })
            .eq('id', input.business_id);
        }
      }

      // Persist in Dexie IndexedDB
      await db.customers.put(newCustomer);
      await db.businesses.update(input.business_id, {
        customer_slots_used: nextSeq,
        updated_at: now,
      });

      // Record Activity
      await this.recordCustomerActivity({
        business_id: input.business_id,
        customer_id: newCustomer.id,
        activity_type: 'customer_registered',
        description: `Customer ${newCustomer.full_name} registered into studio registry.`,
        created_by: input.created_by,
      });

      return { customer: newCustomer, error: null };
    } catch (err) {
      return { customer: null, error: err as Error };
    }
  },

  // Customer Notes
  async getCustomerNotes(customerId: string): Promise<CustomerNoteItem[]> {
    const isLive = isSupabaseConfigured();
    if (isLive) {
      try {
        const { data, error } = await supabase
          .from('customer_notes')
          .select('*, profile:profiles(full_name)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          return data.map((n: any) => ({
            id: n.id,
            business_id: n.business_id,
            customer_id: n.customer_id,
            note: n.note,
            created_by: n.created_by,
            created_at: n.created_at,
            author_name: n.profile?.full_name || 'Staff Member',
          }));
        }
      } catch (err) {
        console.warn('Failed to load notes from Supabase:', err);
      }
    }

    const localNotes = localStorage.getItem(`sewdesk_notes_${customerId}`);
    return localNotes ? JSON.parse(localNotes) : [];
  },

  async addCustomerNote(
    businessId: string,
    customerId: string,
    authorId: string,
    noteText: string,
    authorName?: string
  ): Promise<CustomerNoteItem> {
    const isLive = isSupabaseConfigured();
    const newNote: CustomerNoteItem = {
      id: generateUUID(),
      business_id: businessId,
      customer_id: customerId,
      note: noteText.trim(),
      created_by: authorId,
      created_at: new Date().toISOString(),
      author_name: authorName || 'Staff Member',
    };

    if (isLive) {
      try {
        await supabase.from('customer_notes').insert({
          id: newNote.id,
          business_id: businessId,
          customer_id: customerId,
          note: newNote.note,
          created_by: authorId,
        });
      } catch (err) {
        console.warn('Note online push failed, cached locally:', err);
      }
    }

    const localNotes = await this.getCustomerNotes(customerId);
    const updated = [newNote, ...localNotes];
    localStorage.setItem(`sewdesk_notes_${customerId}`, JSON.stringify(updated));

    // Record activity
    await this.recordCustomerActivity({
      business_id: businessId,
      customer_id: customerId,
      activity_type: 'note_added',
      description: `Workshop note added: "${noteText.slice(0, 45)}${noteText.length > 45 ? '...' : ''}"`,
      created_by: authorId,
    });

    return newNote;
  },

  // Customer Activity Timeline
  async getCustomerActivity(customerId: string): Promise<CustomerActivityItem[]> {
    const isLive = isSupabaseConfigured();
    if (isLive) {
      try {
        const { data } = await supabase
          .from('customer_activity')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (data) return data as CustomerActivityItem[];
      } catch (err) {
        console.warn('Failed to load activity from Supabase:', err);
      }
    }

    const local = localStorage.getItem(`sewdesk_activity_${customerId}`);
    return local ? JSON.parse(local) : [];
  },

  async recordCustomerActivity(item: {
    business_id: string;
    customer_id: string;
    activity_type: string;
    description: string;
    metadata?: Record<string, unknown>;
    created_by: string;
  }): Promise<void> {
    const isLive = isSupabaseConfigured();
    const fullItem: CustomerActivityItem = {
      id: generateUUID(),
      ...item,
      created_at: new Date().toISOString(),
    };

    if (isLive) {
      try {
        await supabase.from('customer_activity').insert(fullItem);
      } catch (err) {
        console.warn('Activity online log failed:', err);
      }
    }

    const current = await this.getCustomerActivity(item.customer_id);
    const updated = [fullItem, ...current];
    localStorage.setItem(`sewdesk_activity_${item.customer_id}`, JSON.stringify(updated));
  },
};

