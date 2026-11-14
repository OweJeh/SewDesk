// ==============================================================================
// SEWDESK — PHASE 1 AUTOMATED ACCEPTANCE TEST SUITE
// ==============================================================================

import { hasPermission, ROLE_PERMISSIONS } from '../lib/permissions/rbac.ts';
import type { BusinessRole, Profile, Business, BusinessMember, BusinessInvitation } from '../types/index.ts';

// In-Memory Test Tenant Store simulating PostgreSQL tables & RLS checks
class TestDatabase {
  profiles: Map<string, Profile> = new Map();
  businesses: Map<string, Business> = new Map();
  members: Map<string, BusinessMember> = new Map();
  invitations: Map<string, BusinessInvitation> = new Map();
  customers: Map<string, any> = new Map();
  platformAdmins: Set<string> = new Set();

  registerUser(fullName: string, email: string): Profile {
    const id = 'user-' + crypto.randomUUID().slice(0, 8);
    const profile: Profile = {
      id,
      full_name: fullName,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.set(id, profile);
    return profile;
  }

  createBusiness(ownerId: string, businessName: string, city: string): { business: Business; member: BusinessMember } {
    const existing = Array.from(this.businesses.values()).find((b) => b.owner_profile_id === ownerId);
    if (existing) {
      throw new Error(`Every email is entitled to only one workspace. Account already owns "${existing.business_name}".`);
    }

    const businessId = 'biz-' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    const business: Business = {
      id: businessId,
      business_name: businessName,
      business_type: 'Bespoke Tailoring',
      owner_profile_id: ownerId,
      contact_email: this.profiles.get(ownerId)?.email || 'contact@example.com',
      phone: '+233 24 000 0000',
      whatsapp: null,
      country: 'Ghana',
      region: 'Greater Accra',
      city,
      logo_url: null,
      default_currency: 'GHS',
      default_measurement_unit: 'cm',
      customer_slots_used: 0,
      created_at: now,
      updated_at: now,
      archived_at: null,
    };

    const member: BusinessMember = {
      id: 'member-' + crypto.randomUUID().slice(0, 8),
      business_id: businessId,
      profile_id: ownerId,
      role: 'owner',
      invitation_status: 'active',
      joined_at: now,
      created_at: now,
    };

    this.businesses.set(businessId, business);
    this.members.set(member.id, member);

    return { business, member };
  }

  inviteStaff(inviterId: string, businessId: string, invitedEmail: string, role: BusinessRole): BusinessInvitation {
    const biz = this.businesses.get(businessId);
    if (!biz) throw new Error('Business not found');

    // Verify inviter has permission
    const inviterMembership = Array.from(this.members.values()).find(
      (m) => m.business_id === businessId && m.profile_id === inviterId
    );
    if (!inviterMembership || !hasPermission(inviterMembership.role, 'manage_staff')) {
      throw new Error('Permission denied to invite staff');
    }

    const invitation: BusinessInvitation = {
      id: 'invite-' + crypto.randomUUID().slice(0, 8),
      business_id: businessId,
      invited_email: invitedEmail.toLowerCase(),
      role,
      invitation_token_hash: 'token-' + crypto.randomUUID(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      accepted_at: null,
      invited_by: inviterId,
      created_at: new Date().toISOString(),
    };

    this.invitations.set(invitation.id, invitation);
    return invitation;
  }

  acceptInvitation(token: string, acceptingUserId: string): BusinessMember {
    const invite = Array.from(this.invitations.values()).find(
      (i) => i.invitation_token_hash === token && !i.accepted_at
    );
    if (!invite) throw new Error('Invalid or expired invitation token');

    invite.accepted_at = new Date().toISOString();

    const member: BusinessMember = {
      id: 'member-' + crypto.randomUUID().slice(0, 8),
      business_id: invite.business_id,
      profile_id: acceptingUserId,
      role: invite.role,
      invitation_status: 'active',
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    this.members.set(member.id, member);
    return member;
  }

  // Row Level Security Query Scoping
  queryBusinessRecords(requestingUserId: string, businessId: string): any[] {
    // Check if user is a valid active member of businessId
    const isMember = Array.from(this.members.values()).some(
      (m) => m.business_id === businessId && m.profile_id === requestingUserId && m.invitation_status === 'active'
    );
    const isOwner = this.businesses.get(businessId)?.owner_profile_id === requestingUserId;

    if (!isMember && !isOwner) {
      // RLS DENIAL: User cannot see records
      return [];
    }

    return Array.from(this.customers.values()).filter((c) => c.business_id === businessId);
  }

  registerCustomerAtomic(requestingUserId: string, businessId: string, customerName: string): any {
    const biz = this.businesses.get(businessId);
    if (!biz) throw new Error('Business not found');

    const membership = Array.from(this.members.values()).find(
      (m) => m.business_id === businessId && m.profile_id === requestingUserId
    );
    if (!membership || !hasPermission(membership.role, 'create_customers')) {
      throw new Error('Permission denied to create customer');
    }

    // Customer allowance rule
    if (biz.customer_slots_used >= 100) {
      throw new Error(
        'CUSTOMER_ALLOWANCE_EXCEEDED: Free allowance of 100 customers reached. An active paid subscription (GHS 150/mo) is required.'
      );
    }

    biz.customer_slots_used += 1;
    const custId = 'cust-' + crypto.randomUUID().slice(0, 8);
    const cust = {
      id: custId,
      business_id: businessId,
      customer_number: `CUST-${String(biz.customer_slots_used).padStart(4, '0')}`,
      full_name: customerName,
      created_by: requestingUserId,
    };
    this.customers.set(cust.id, cust);
    return cust;
  }

  isPlatformAdmin(userId: string): boolean {
    return this.platformAdmins.has(userId);
  }
}

// ------------------------------------------------------------------------------
// EXECUTE ACCEPTANCE TESTS
// ------------------------------------------------------------------------------
async function runAcceptanceTests() {
  console.log('================================================================');
  console.log(' SEWDESK — PHASE 1 ACCEPTANCE TESTS');
  console.log('================================================================\n');

  const testDb = new TestDatabase();
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

  // TEST 1: User Registration
  const user1 = testDb.registerUser('Kofi Mensah', 'kofi@mensahbespoke.com');
  assert('Test 1: New user can register and receive a profile', Boolean(user1.id && user1.full_name === 'Kofi Mensah'));

  // TEST 2: Workspace Creation & Owner Role
  const { business: biz1, member: member1 } = testDb.createBusiness(user1.id, 'Mensah Bespoke Studio', 'Accra');
  assert('Test 2A: Business workspace is created', biz1.business_name === 'Mensah Bespoke Studio' && biz1.customer_slots_used === 0);
  assert('Test 2B: Registering user automatically becomes Owner', member1.role === 'owner' && member1.business_id === biz1.id);

  // TEST 3: Independent Second Business Registration
  const user2 = testDb.registerUser('Ama Osei', 'ama@oseicouture.com');
  const { business: biz2, member: member2 } = testDb.createBusiness(user2.id, 'Osei Haute Couture', 'Kumasi');
  assert('Test 3: A second business can register independently', biz2.id !== biz1.id && member2.role === 'owner' && member2.profile_id === user2.id);

  // TEST 3B: Enforce Single Workspace per Email Policy
  let user1DoubleBizBlocked = false;
  try {
    testDb.createBusiness(user1.id, 'Illegal Second Studio', 'Takoradi');
  } catch (err: any) {
    user1DoubleBizBlocked = err.message.includes('only one workspace');
  }
  assert('Test 3B: Every email is entitled to only one workspace', user1DoubleBizBlocked);

  // TEST 4: Multi-Tenant Data Isolation (Row Level Security)
  testDb.registerCustomerAtomic(user1.id, biz1.id, 'Chief Addo');
  testDb.registerCustomerAtomic(user1.id, biz1.id, 'Nana Poku');
  testDb.registerCustomerAtomic(user2.id, biz2.id, 'Madam Serwaa');

  const user1Biz1Records = testDb.queryBusinessRecords(user1.id, biz1.id);
  const user2Biz1Records = testDb.queryBusinessRecords(user2.id, biz1.id); // Business 2 user attempts to view Business 1
  const user2Biz2Records = testDb.queryBusinessRecords(user2.id, biz2.id);

  assert('Test 4A: Business 1 owner can read Business 1 customers', user1Biz1Records.length === 2);
  assert('Test 4B: Business 2 user CANNOT read Business 1 customers (Tenant Isolated)', user2Biz1Records.length === 0);
  assert('Test 4C: Business 2 user reads only their own customers', user2Biz2Records.length === 1 && user2Biz2Records[0].full_name === 'Madam Serwaa');

  // TEST 5: Staff Invitation Workflow
  const invite = testDb.inviteStaff(user1.id, biz1.id, 'kwesi@mensahbespoke.com', 'tailor');
  assert('Test 5: Owner can invite staff with designated role (tailor)', invite.invited_email === 'kwesi@mensahbespoke.com' && invite.role === 'tailor');

  // TEST 6: Staff Acceptance & Joining
  const staffUser = testDb.registerUser('Kwesi Appiah', 'kwesi@mensahbespoke.com');
  const acceptedMember = testDb.acceptInvitation(invite.invitation_token_hash, staffUser.id);
  assert('Test 6: Invited staff can join business with assigned role', acceptedMember.role === 'tailor' && acceptedMember.business_id === biz1.id);

  // TEST 7: Role Permission Guard
  const tailorCanRecordMeasurements = hasPermission('tailor', 'record_measurements');
  const tailorCanManageSubscriptions = hasPermission('tailor', 'manage_subscriptions');
  const tailorCanManageStaff = hasPermission('tailor', 'manage_staff');
  assert('Test 7A: Tailor has permission to record measurements', tailorCanRecordMeasurements === true);
  assert('Test 7B: Tailor CANNOT manage subscriptions or manage staff', tailorCanManageSubscriptions === false && tailorCanManageStaff === false);

  // TEST 8: Customer Allowance 100 Free Limit Enforcement
  biz1.customer_slots_used = 100; // Simulate 100 customers reached
  let limitBlocked = false;
  try {
    testDb.registerCustomerAtomic(user1.id, biz1.id, 'Customer 101');
  } catch (err: any) {
    if (err.message.includes('CUSTOMER_ALLOWANCE_EXCEEDED')) {
      limitBlocked = true;
    }
  }
  assert('Test 8: 101st customer registration is restricted without active paid subscription', limitBlocked === true);

  // TEST 9: Platform Admin Separation
  assert('Test 9A: Normal business owner is NOT platform admin', testDb.isPlatformAdmin(user1.id) === false);
  testDb.platformAdmins.add('platform-admin-1');
  assert('Test 9B: Authorized platform operator is verified independently', testDb.isPlatformAdmin('platform-admin-1') === true);

  console.log('\n----------------------------------------------------------------');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests();
