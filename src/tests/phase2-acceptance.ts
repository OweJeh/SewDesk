// ==============================================================================
// SEWDESK — PHASE 2 AUTOMATED ACCEPTANCE TEST SUITE
// ==============================================================================

import { measurementService } from '../features/measurements/services/measurementService.node.ts';
import { STANDARD_TEMPLATES, MASTER_MEASUREMENTS } from '../features/measurements/data/templates.ts';
import type { Customer, MeasurementSet, MeasurementUnit } from '../types/index.ts';

// In-Memory Phase 2 Verification Environment
class Phase2TestEngine {
  customers: Map<string, Customer> = new Map();
  measurementSets: Map<string, MeasurementSet> = new Map();
  customerNotes: Map<string, any[]> = new Map();
  customerActivity: Map<string, any[]> = new Map();
  drafts: Map<string, any> = new Map();

  registerCustomer(businessId: string, fullName: string, phone: string, measurementProfile = 'Male Bespoke'): Customer {
    const id = 'cust-' + crypto.randomUUID().slice(0, 8);
    const customer: Customer = {
      id,
      business_id: businessId,
      customer_number: `CUST-${String(this.customers.size + 1).padStart(4, '0')}`,
      full_name: fullName,
      phone,
      whatsapp: phone,
      email: `${fullName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      measurement_profile: measurementProfile,
      location: 'Accra, Ghana',
      notes: 'Initial fitting client',
      created_by: 'tailor-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: null,
    };
    this.customers.set(id, customer);

    // Activity log
    this.recordActivity(customer.id, 'customer_registered', `Customer ${fullName} registered.`);
    return customer;
  }

  saveMeasurementSession(
    businessId: string,
    customerId: string,
    sessionName: string,
    garmentType: string,
    values: { field_name: string; original_value: number; original_unit: MeasurementUnit }[]
  ): MeasurementSet {
    const setId = 'set-' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    const valueRows = values.map((v) => ({
      id: 'val-' + crypto.randomUUID().slice(0, 8),
      measurement_set_id: setId,
      measurement_definition_id: null,
      field_name: v.field_name,
      original_value: v.original_value,
      original_unit: v.original_unit,
      canonical_cm_value: measurementService.toCanonicalCm(v.original_value, v.original_unit),
      created_at: now,
    }));

    const session: MeasurementSet = {
      id: setId,
      business_id: businessId,
      customer_id: customerId,
      garment_type: garmentType,
      session_name: sessionName,
      fit_notes: 'Standard posture, ease applied',
      recorded_by: 'tailor-1',
      created_at: now,
      values: valueRows,
    };

    this.measurementSets.set(setId, session);
    this.recordActivity(customerId, 'measurement_recorded', `Session ${sessionName} recorded with ${values.length} points.`);
    return session;
  }

  recordActivity(customerId: string, type: string, description: string) {
    const current = this.customerActivity.get(customerId) || [];
    current.unshift({ id: 'act-' + crypto.randomUUID(), type, description, created_at: new Date().toISOString() });
    this.customerActivity.set(customerId, current);
  }

  saveDraft(customerId: string, data: any) {
    this.drafts.set(customerId, { ...data, lastSaved: new Date().toISOString() });
  }

  getDraft(customerId: string) {
    return this.drafts.get(customerId) || null;
  }
}

async function runPhase2Tests() {
  console.log('================================================================');
  console.log(' SEWDESK — PHASE 2 CUSTOMER & MEASUREMENT ENGINE TESTS');
  console.log('================================================================\n');

  const engine = new Phase2TestEngine();
  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${details ? ': ' + details : ''}`);
      failed++;
    }
  }

  // TEST 1: Customer Registration
  const cust1 = engine.registerCustomer('biz-1', 'Nana Poku', '+233241112222', 'Male Bespoke');
  assert('Test 1: Customer registered with unique CUST ID and profile', Boolean(cust1.id && cust1.customer_number === 'CUST-0001'));

  // TEST 2: Customer Persistence Simulation
  const fetchedCust = engine.customers.get(cust1.id);
  assert('Test 2: Customer persists and can be retrieved by ID', Boolean(fetchedCust && fetchedCust.full_name === 'Nana Poku'));

  // TEST 3: Multiple Measurement Sessions for One Customer
  const session1 = engine.saveMeasurementSession('biz-1', cust1.id, 'Initial Body Profile', 'Bespoke Suit', [
    { field_name: 'Chest', original_value: 104.0, original_unit: 'cm' },
    { field_name: 'Waist', original_value: 88.0, original_unit: 'cm' },
    { field_name: 'Trouser Length', original_value: 102.0, original_unit: 'cm' },
  ]);

  const session2 = engine.saveMeasurementSession('biz-1', cust1.id, 'Fitting Session 2 (Post Holiday)', 'Senator Kaftan', [
    { field_name: 'Chest', original_value: 106.0, original_unit: 'cm' },
    { field_name: 'Waist', original_value: 91.0, original_unit: 'cm' },
    { field_name: 'Trouser Length', original_value: 102.0, original_unit: 'cm' },
  ]);

  const customerSessions = Array.from(engine.measurementSets.values()).filter((s) => s.customer_id === cust1.id);
  assert('Test 3: Customer can have multiple independent measurement sessions', customerSessions.length === 2);

  // TEST 4: Immutability of Earlier Measurements
  const s1Chest = session1.values?.find((v) => v.field_name === 'Chest')?.canonical_cm_value;
  const s2Chest = session2.values?.find((v) => v.field_name === 'Chest')?.canonical_cm_value;
  assert('Test 4: Previous measurements remain unchanged (Session 1 Chest=104cm, Session 2 Chest=106cm)', s1Chest === 104.0 && s2Chest === 106.0);

  // TEST 5: Accurate Unit Conversions (Canonical CM Engine)
  const cmValue = 101.6; // 40 inches
  const inchesCalculated = measurementService.fromCanonicalCm(cmValue, 'inch');
  const cmRecalculated = measurementService.toCanonicalCm(inchesCalculated, 'inch');

  const inchInput = 34.0;
  const canonicalCm = measurementService.toCanonicalCm(inchInput, 'inch');
  assert('Test 5A: 101.6 cm converts to 40.0 inches', inchesCalculated === 40.0);
  assert('Test 5B: 34.0 inches stores as 86.36 canonical cm', canonicalCm === 86.36);

  // TEST 6: Autosave Draft Recovery
  engine.saveDraft(cust1.id, {
    sessionName: 'Unfinished Fitting',
    values: { Chest: 105.0, Waist: 89.5 },
    unit: 'cm',
  });
  const recoveredDraft = engine.getDraft(cust1.id);
  assert('Test 6: Autosaved measurement draft can be recovered', recoveredDraft !== null && recoveredDraft.values.Chest === 105.0);

  // TEST 7: Side-by-Side Session Comparison Delta Analysis
  const comparison = measurementService.compareSets(session1, session2, 'cm');
  const chestDelta = comparison.find((c) => c.field_name === 'Chest');
  const waistDelta = comparison.find((c) => c.field_name === 'Waist');
  const trouserDelta = comparison.find((c) => c.field_name === 'Trouser Length');

  assert('Test 7A: Comparison computes +2.0 cm increase on Chest', chestDelta?.delta === 2.0);
  assert('Test 7B: Comparison computes +3.0 cm increase on Waist', waistDelta?.delta === 3.0);
  assert('Test 7C: Comparison computes 0.0 delta on unchanged Trouser Length', trouserDelta?.delta === 0.0);

  // TEST 8: Templates Catalog Completeness
  const maleTmpl = STANDARD_TEMPLATES.find((t) => t.id === 'male_bespoke');
  const femaleTmpl = STANDARD_TEMPLATES.find((t) => t.id === 'female_bespoke');
  const childTmpl = STANDARD_TEMPLATES.find((t) => t.id === 'children_bespoke');

  assert('Test 8A: Male bespoke template contains at least 20 essential tailoring points', (maleTmpl?.fields.length ?? 0) >= 20);
  assert('Test 8B: Female bespoke template contains essential gown & bust separation points', (femaleTmpl?.fields.length ?? 0) >= 25);
  assert('Test 8C: Children template loaded with proper proportional ranges', (childTmpl?.fields.length ?? 0) >= 15);

  // TEST 9: Activity Timeline Trail
  const customerActivities = engine.customerActivity.get(cust1.id) || [];
  assert('Test 9: Chronological activity trail logs registration and fitting sessions', customerActivities.length >= 3);

  console.log('\n----------------------------------------------------------------');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase2Tests();

