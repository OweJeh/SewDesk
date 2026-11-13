// ==============================================================================
// SEWDESK — MEASUREMENT SERVICE NODE-COMPATIBLE SHIM (Test Environment)
// Pure functions only — no browser APIs, no Supabase, no Dexie
// ==============================================================================

import type { MeasurementSet, MeasurementUnit } from '../../../types/index.ts';

export interface RecordedValuePayload {
  field_name: string;
  original_value: number;
  original_unit: MeasurementUnit;
  canonical_cm_value: number;
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

// In-memory draft store (replaces localStorage for Node context)
const _draftStore = new Map<string, MeasurementDraft>();

export const measurementService = {
  toCanonicalCm(value: number, unit: MeasurementUnit): number {
    if (unit === 'cm') return +value.toFixed(2);
    return +(value * 2.54).toFixed(2);
  },

  fromCanonicalCm(cmValue: number, targetUnit: MeasurementUnit): number {
    if (targetUnit === 'cm') return +cmValue.toFixed(1);
    return +(cmValue / 2.54).toFixed(1);
  },

  saveDraft(customerId: string, draft: Omit<MeasurementDraft, 'lastSaved'>): void {
    _draftStore.set(customerId, { ...draft, lastSaved: new Date().toISOString() });
  },

  getDraft(customerId: string): MeasurementDraft | null {
    return _draftStore.get(customerId) ?? null;
  },

  clearDraft(customerId: string): void {
    _draftStore.delete(customerId);
  },

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

