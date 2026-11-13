// ==============================================================================
// SEWDESK — MEASUREMENT SERVICE & IMMUTABLE HISTORY ENGINE
// ==============================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { db } from '@/offline/database/dexie-db';
import { toCanonicalCm, fromCanonicalCm, compareSets } from '@/lib/calculations/measurements';
import { generateUUID } from '@/lib/utils';
import type { MeasurementSet, MeasurementValue, MeasurementUnit } from '@/types';

export interface RecordedValuePayload {
  field_name: string;
  original_value: number;
  original_unit: MeasurementUnit;
  canonical_cm_value: number;
}

export interface CreateMeasurementSetInput {
  business_id: string;
  customer_id: string;
  template_id?: string;
  garment_type: string;
  session_name: string;
  fit_notes?: string;
  recorded_by: string;
  values: RecordedValuePayload[];
}

export interface MeasurementDraft {
  customerId: string;
  garmentType: string;
  sessionName: string;
  fitNotes: string;
  unit: MeasurementUnit;
  values: Record<string, number>;
  lastSaved: string;
}

const DRAFT_STORAGE_PREFIX = 'sewdesk_measurement_draft_';

export const measurementService = {
  // Convert unit to canonical cm
  toCanonicalCm(value: number, unit: MeasurementUnit): number {
    if (unit === 'cm') return +value.toFixed(2);
    return +(value * 2.54).toFixed(2);
  },

  // Convert canonical cm to display unit
  fromCanonicalCm(cmValue: number, targetUnit: MeasurementUnit): number {
    if (targetUnit === 'cm') return +cmValue.toFixed(1);
    return +(cmValue / 2.54).toFixed(1);
  },

  // Save autosave draft locally
  saveDraft(customerId: string, draft: Omit<MeasurementDraft, 'lastSaved'>): void {
    const payload: MeasurementDraft = {
      ...draft,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${customerId}`, JSON.stringify(payload));
  },

  // Retrieve autosave draft
  getDraft(customerId: string): MeasurementDraft | null {
    const raw = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${customerId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as MeasurementDraft;
    } catch {
      return null;
    }
  },

  // Clear draft after finalizing
  clearDraft(customerId: string): void {
    localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${customerId}`);
  },

  // Fetch all measurement sessions for a customer
  async getCustomerMeasurementSets(customerId: string): Promise<MeasurementSet[]> {
    const isLive = isSupabaseConfigured();

    if (isLive) {
      try {
        const { data: sets, error: sErr } = await supabase
          .from('measurement_sets')
          .select('*, values:measurement_values(*)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (sets && !sErr) {
          // Sync to Dexie
          for (const s of sets) {
            await db.measurementSets.put(s as MeasurementSet);
            if (s.values) {
              for (const v of s.values) {
                await db.measurementValues.put(v as MeasurementValue);
              }
            }
          }
          return sets as MeasurementSet[];
        }
      } catch (err) {
        console.warn('Measurement sets fetch online failed, checking local:', err);
      }
    }

    // Dexie Local Retrieval
    const localSets = await db.measurementSets
      .where('customer_id')
      .equals(customerId)
      .reverse()
      .sortBy('created_at');

    // Attach values
    const hydrated = await Promise.all(
      localSets.map(async (set) => {
        const values = await db.measurementValues
          .where('measurement_set_id')
          .equals(set.id)
          .toArray();
        return { ...set, values };
      })
    );

    return hydrated;
  },

  // Get a single measurement set by ID
  async getMeasurementSetById(setId: string): Promise<MeasurementSet | null> {
    const isLive = isSupabaseConfigured();

    if (isLive) {
      try {
        const { data, error } = await supabase
          .from('measurement_sets')
          .select('*, values:measurement_values(*)')
          .eq('id', setId)
          .single();

        if (data && !error) return data as MeasurementSet;
      } catch (err) {
        console.warn('Single measurement set fetch failed:', err);
      }
    }

    const localSet = await db.measurementSets.get(setId);
    if (!localSet) return null;
    const values = await db.measurementValues
      .where('measurement_set_id')
      .equals(setId)
      .toArray();
    return { ...localSet, values };
  },

  // Save an immutable, completed measurement set
  async saveMeasurementSet(input: CreateMeasurementSetInput): Promise<{ set: MeasurementSet | null; error: Error | null }> {
    const isLive = isSupabaseConfigured();
    const setId = generateUUID();
    const now = new Date().toISOString();

    const newSet: MeasurementSet = {
      id: setId,
      business_id: input.business_id,
      customer_id: input.customer_id,
      template_id: input.template_id || null,
      garment_type: input.garment_type,
      session_name: input.session_name,
      fit_notes: input.fit_notes || null,
      recorded_by: input.recorded_by,
      created_at: now,
    };

    const valueRows: MeasurementValue[] = input.values.map((v) => ({
      id: generateUUID(),
      measurement_set_id: setId,
      measurement_definition_id: null,
      field_name: v.field_name,
      original_value: v.original_value,
      original_unit: v.original_unit,
      canonical_cm_value: v.canonical_cm_value,
      created_at: now,
    }));

    try {
      if (isLive) {
        const { error: sErr } = await supabase.from('measurement_sets').insert(newSet);
        if (sErr) throw sErr;

        if (valueRows.length > 0) {
          const { error: vErr } = await supabase.from('measurement_values').insert(valueRows);
          if (vErr) throw vErr;
        }
      }

      // Local Dexie Persistence
      await db.measurementSets.put(newSet);
      for (const val of valueRows) {
        await db.measurementValues.put(val);
      }

      // Clear draft
      this.clearDraft(input.customer_id);

      return { set: { ...newSet, values: valueRows }, error: null };
    } catch (err) {
      return { set: null, error: err as Error };
    }
  },

  // Compare two measurement sets and compute deltas
  compareSets(
    setA: MeasurementSet,
    setB: MeasurementSet,
    targetUnit: MeasurementUnit = 'cm'
  ): { field_name: string; valA: number; valB: number; delta: number; deltaPercent: number }[] {
    const mapA = new Map<string, number>();
    const mapB = new Map<string, number>();

    setA.values?.forEach((v) => mapA.set(v.field_name, v.canonical_cm_value));
    setB.values?.forEach((v) => mapB.set(v.field_name, v.canonical_cm_value));

    const allKeys = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));

    return allKeys.map((key) => {
      const cmA = mapA.get(key) ?? 0;
      const cmB = mapB.get(key) ?? 0;

      const valA = this.fromCanonicalCm(cmA, targetUnit);
      const valB = this.fromCanonicalCm(cmB, targetUnit);
      const delta = +(valB - valA).toFixed(1);
      const deltaPercent = valA > 0 ? +((delta / valA) * 100).toFixed(1) : 0;

      return { field_name: key, valA, valB, delta, deltaPercent };
    });
  },
};
