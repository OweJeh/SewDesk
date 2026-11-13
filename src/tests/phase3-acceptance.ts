// ==============================================================================
// SEWDESK — PHASE 3 WORKSHOP ORDERS & FINANCIAL PIPELINE ACCEPTANCE TESTS
// ==============================================================================

import { OrderTestEngine } from '../features/orders/services/orderService.node.ts';
import type { Customer, MeasurementSet } from '../types/index.ts';

async function runPhase3Tests() {
  console.log('================================================================');
  console.log(' SEWDESK — PHASE 3 WORKSHOP ORDERS & FINANCIAL PIPELINE TESTS');
  console.log('================================================================\n');

  const engine = new OrderTestEngine();
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

  const bizId = 'biz-accra-tailors';
  const customerId = 'cust-poku-001';
  const measurementSetId = 'meas-poku-suit-001';

  // TEST 1: Order Creation with Links
  const order1 = engine.createOrder({
    business_id: bizId,
    customer_id: customerId,
    measurement_set_id: measurementSetId,
    garment_type: '3-Piece Bespoke Suit',
    style: 'Slim-fit double breasted with peak lapels',
    fabric: 'Super 150s Merino Wool',
    colour: 'Midnight Navy',
    total_price: 2400.0,
    currency: 'GHS',
    due_date: '2026-12-15',
    created_by: 'owner-1',
    initial_deposit: 1200.0,
    deposit_payment_method: 'mobile_money',
  });

  assert(
    'Test 1: Order created with links to customer, measurement set, and sequential number',
    Boolean(
      order1.id &&
      order1.order_number === 'ORD-0001' &&
      order1.customer_id === customerId &&
      order1.measurement_set_id === measurementSetId
    )
  );

  // TEST 2: Sequential Numbering for Next Order in Same Business
  const order2 = engine.createOrder({
    business_id: bizId,
    customer_id: customerId,
    measurement_set_id: measurementSetId,
    garment_type: 'Senator Kaftan',
    style: 'Mandarin collar with chest embroidery',
    fabric: 'Vlisco Hollandais Wax',
    colour: 'Royal Purple & Gold',
    total_price: 850.0,
    currency: 'GHS',
    created_by: 'owner-1',
    initial_deposit: 0,
  });

  assert(
    'Test 2: Next order for same studio automatically gets sequential ORD-0002',
    order2.order_number === 'ORD-0002'
  );

  // TEST 3: Initial Deposit Calculation and Balance Deduction
  assert(
    'Test 3A: Order 1 with GHS 2400 total and GHS 1200 deposit records amount_paid = 1200',
    order1.amount_paid === 1200.0
  );
  assert(
    'Test 3B: Order 1 remaining balance is exactly GHS 1200.00',
    order1.balance === 1200.0
  );
  assert(
    'Test 3C: Order 2 without deposit has amount_paid = 0 and full balance = GHS 850.00',
    order2.amount_paid === 0 && order2.balance === 850.0
  );

  // TEST 4: Initial Status & Audit History Trail
  assert(
    'Test 4A: Newly created order has initial status "not_started"',
    order1.status === 'not_started'
  );
  assert(
    'Test 4B: Initial status history item created upon order creation',
    order1.status_history.length >= 1 && order1.status_history[0].new_status === 'not_started'
  );

  // TEST 5: Production Pipeline Progression (Cutting -> Sewing -> Fitting)
  const cutOrder = engine.updateOrderStatus(order1.id, 'cutting', 'Pattern drafted, shears to cloth', 'cutter-kwame');
  assert(
    'Test 5A: Advanced to "cutting" stage by workshop cutter',
    cutOrder.status === 'cutting' && cutOrder.status_history[0].note?.includes('shears to cloth')
  );

  const sewOrder = engine.updateOrderStatus(order1.id, 'sewing', 'Assembling canvas and hand-stitching lapels', 'tailor-kofi');
  assert(
    'Test 5B: Advanced to "sewing" stage by master tailor',
    sewOrder.status === 'sewing'
  );

  const fitOrder = engine.updateOrderStatus(order1.id, 'fitting', 'Basting trial scheduled with client', 'assistant-ama');
  assert(
    'Test 5C: Advanced to "fitting" stage with audit log note',
    fitOrder.status === 'fitting'
  );

  // TEST 6: Audit Log Integrity
  const history = engine.statusHistory.get(order1.id) || [];
  assert(
    'Test 6: Order status history contains full chronological lifecycle trail (>= 4 records)',
    history.length >= 4
  );

  // TEST 7: Subsequent Payment Collection Settles Balance
  const finalPayment = engine.recordPayment(order1.id, 1200.0, 'mobile_money');
  assert(
    'Test 7A: Final payment of GHS 1200 recorded successfully',
    finalPayment.amount === 1200.0 && finalPayment.method === 'mobile_money'
  );
  assert(
    'Test 7B: Order balance is now 0.00 (Fully Settled)',
    order1.balance === 0.0 && order1.amount_paid === 2400.0
  );

  // TEST 8: Ready for Pickup & Delivery
  engine.updateOrderStatus(order1.id, 'ready', 'Garment pressed, bagged with SewDesk hanger', 'owner-1');
  const deliveredOrder = engine.updateOrderStatus(order1.id, 'delivered', 'Handed to client, fitting verified perfect', 'owner-1');
  assert(
    'Test 8: Order marked as "delivered" to customer',
    deliveredOrder.status === 'delivered'
  );

  console.log('\n----------------------------------------------------------------');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase3Tests();
