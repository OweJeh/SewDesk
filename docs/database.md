# SewDesk — Database Specification & Schema Model

## 1. Relational Entity Relationship Diagram

```
[auth.users] (Supabase Auth)
     |
     v 1:1
[profiles] <--------------------+
     |                          |
     | (owner_profile_id)       | (profile_id)
     v                          |
[businesses] <-----------+   [business_members]
  - customer_slots_used   |      - role (owner, admin, tailor, assistant, accountant)
                          |
     +--------------------+--------------------+--------------------+
     |                    |                    |                    |
     v                    v                    v                    v
[customers]     [measurement_templates]    [orders]             [payments]
     |                    |                    |                    |
     +----------+         +----------+         +----------+         +----------+
     |          |         |          |         |          |         |          |
     v          v         v          v         v          v         v          v
[notes]    [activity] [fields]  [definitions] [history] [fittings] [refunds]
                                     |
                                     v
                             [measurement_sets]
                                     |
                                     v
                             [measurement_values]
```

## 2. Table Specifications

### Identity & Tenancy
- **`profiles`**: Linked 1:1 to `auth.users(id)`. Stores full name, email, phone, avatar.
- **`businesses`**: Core tenant entity. Stores business name, business type, owner reference, contact info, default currency (default 'GHS'), default unit ('cm' or 'inch'), and authoritative `customer_slots_used` integer.
- **`business_members`**: Join table mapping `profiles` to `businesses` with `role` (enum: `'owner'`, `'admin'`, `'tailor'`, `'assistant'`, `'accountant'`) and status.
- **`business_invitations`**: Pending staff invitations with hashed token, expiry timestamp, and invited role.
- **`member_permissions`**: Granular capability overrides if custom privileges are granted.
- **`platform_admins`**: Separate table storing platform administrator user IDs.

### Customer Management
- **`customers`**: Tenant-scoped customer records (`business_id`, unique `customer_number` within tenant, full name, phone, whatsapp, email, location, notes, archive flag).
- **`customer_notes`**: Timestamped customer notes authored by staff.
- **`customer_activity`**: Audit trail of customer interactions (orders, fittings, payments, measurements).

### Measurements
- **`measurement_definitions`**: Catalog of standard and custom body measurements (name, code, category, validation min/max).
- **`measurement_templates`**: Groupings of measurements (Male, Female, Children, Custom, Garment-specific).
- **`template_fields`**: Ordered definitions within a template.
- **`measurement_sets`**: Historical, immutable measurement sessions for a customer.
- **`measurement_values`**: Key-value pairs per set storing canonical centimeter value alongside original entered value and unit.

### Orders & Production
- **`orders`**: Garment production orders linking customer, exact `measurement_set_id`, garment type, fabrics, total price, status (`not_started`, `cutting`, `sewing`, `fitting`, `ready`, `delivered`, `cancelled`).
- **`order_status_history`**: Immutable status change timeline with user attribution and notes.
- **`order_attachments`**: Reference images and sketches.
- **`fittings`**: Fitting sessions, notes, alteration requests, and completion timestamps.

### Payments & Finance
- **`payments`**: Transaction records (`order_id`, `amount`, `currency`, `method`: Cash, Mobile Money, Bank Transfer, Other, `reference`, `recorded_by`).
- **`refunds`**: Audited refund/correction records.

### Subscriptions & Platform Administration
- **`subscription_plans`**: Available plans (e.g., Free 100 customers, Pro GHS 150/mo).
- **`subscriptions`**: Active business subscription contracts, validity windows, and statuses.
- **`payment_transactions`**: Webhook-verified payment provider transactions (Paystack, Hubtel).
- **`audit_logs`**: System-wide administrative action logs.

