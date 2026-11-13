// ==============================================================================
// SEWDESK — PURE MEASUREMENT CALCULATIONS & CONVERSIONS
// ==============================================================================

import type { MeasurementUnit, MeasurementSet } from '../../types/index.ts';

// Convert value in given unit to canonical cm
export function toCanonicalCm(value: number, unit: MeasurementUnit): number {
  if (unit === 'cm') return +value.toFixed(2);
  return +(value * 2.54).toFixed(2);
}

// Convert canonical cm to display unit
export function fromCanonicalCm(cmValue: number, targetUnit: MeasurementUnit): number {
  if (targetUnit === 'cm') return +cmValue.toFixed(1);
  return +(cmValue / 2.54).toFixed(1);
}

// Compare two measurement sets and compute deltas
export function compareSets(
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

    const valA = fromCanonicalCm(cmA, targetUnit);
    const valB = fromCanonicalCm(cmB, targetUnit);
    const delta = +(valB - valA).toFixed(1);
    const deltaPercent = valA > 0 ? +((delta / valA) * 100).toFixed(1) : 0;

    return { field_name: key, valA, valB, delta, deltaPercent };
  });
}

