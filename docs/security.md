# SewDesk — Security Architecture & Row Level Security

## 1. Multi-Tenant Isolation Strategy

In SewDesk, multi-tenancy is enforced strictly at the database layer using PostgreSQL Row Level Security (RLS). A user can only access records belonging to a business where they have an active membership.

### Core Security Rules

1. **No Shared Direct Tables:**
   Every tenant-scoped table (`customers`, `measurement_sets`, `orders`, `payments`, etc.) includes a non-nullable `business_id` foreign key with an index.

2. **Non-Recursive RLS Helpers:**
   To prevent infinite recursion when checking `business_members`, helper functions are marked `SECURITY DEFINER` with fixed `search_path = public`:
   - `auth_user_business_ids()` returns all business IDs the current `auth.uid()` belongs to.
   - `is_business_member(b_id uuid)` checks membership.
   - `is_business_owner(b_id uuid)` checks if user is the Owner.
   - `is_platform_admin()` checks if `auth.uid()` exists in `platform_admins`.

3. **Authoritative Lifetime Customer Allowance:**
   - The first 100 registered customers per business are free.
   - Registration of customer #101 requires an active paid subscription.
   - `customer_slots_used` in the `businesses` table cannot be updated directly by client queries (`UPDATE` restricted via column-level permissions and trigger).
   - Customer creation must execute via the PostgreSQL function `register_customer_atomic()`, which locks the business row (`SELECT ... FOR UPDATE`), verifies active entitlement, checks limit, inserts the customer, and increments the slot counter atomically.
   - Concurrency race conditions between two staff members registering customers simultaneously are prevented by row-level locking.

4. **Platform Administration Separation:**
   - Platform administration (`/platform/*`) routes and database operations are guarded by `platform_admins`.
   - Business owners cannot promote themselves to platform administrators via profile edits.
   - Platform administrators do not automatically become members of tenant workspaces.
