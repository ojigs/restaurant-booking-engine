# Database Schema Documentation v1.0.0

## 1. Architectural Standards

- **Engine**: PostgreSQL 15+ (ACID compliant for transaction safety).
- **Primary Keys**: UUID (v4) generated via `pgcrypto` (`gen_random_uuid()`).
- **Temporal Strategy**: All timestamps use `TIMESTAMPTZ` to ensure UTC consistency across global server deployments.
- **Soft Deletion**: Implemented via `is_active` boolean flags to maintain historical data integrity for bookings and financial audits.

---

## 2. Core Menu Hierarchy

### 2.1 Categories (`categories`)

The root of the multi-tenant menu.

| Column         | Type         | Constraints | Description                      |
| :------------- | :----------- | :---------- | :------------------------------- |
| id             | UUID         | PK          | Unique identifier                |
| restaurant_id  | UUID         | NOT NULL    | Multi-tenancy owner              |
| name           | VARCHAR(100) | NOT NULL    | Category name                    |
| tax_applicable | BOOLEAN      | NOT NULL    | Default: false                   |
| tax_percentage | DECIMAL(5,2) | NULLABLE    | Mandatory if tax_applicable=true |

**Key Constraints:**

- `UNIQUE(restaurant_id, name)`: Prevents duplicate categories per restaurant.
- `ck_tax_percentage_required`: Database-level check ensuring tax data is provided for taxable categories.

**Indexes:**

- `idx_categories_restaurant_id`: Optimized for tenant-scoped lookups.
- `idx_categories_is_active`: Filtered index for active menu rendering.

---

### 2.2 Subcategories (`subcategories`)

Optional second tier of organization.

| Column         | Type         | Constraints  | Description                      |
| :------------- | :----------- | :----------- | :------------------------------- |
| id             | UUID         | PK           |                                  |
| category_id    | UUID         | FK (CASCADE) | Links to parent category         |
| tax_applicable | BOOLEAN      | NULLABLE     | NULL = Inherit from Category     |
| tax_percentage | DECIMAL(5,2) | NULLABLE     | Mandatory if tax_applicable=true |

**Key Constraints:**

- `UNIQUE(category_id, name)`: Prevents duplicate subcategories within a category.
- `ck_sub_tax_percentage_required`: Enforces logic when overriding tax.

---

### 2.3 Items (`items`)

The leaf nodes of the hierarchy. Supports products and bookable services.

| Column         | Type    | Constraints  | Description                |
| :------------- | :------ | :----------- | :------------------------- |
| id             | UUID    | PK           |                            |
| category_id    | UUID    | FK (CASCADE) | Optional direct parent     |
| subcategory_id | UUID    | FK (CASCADE) | Optional sub-parent        |
| is_bookable    | BOOLEAN | NOT NULL     | Flag for service items     |
| tax_applicable | BOOLEAN | NULLABLE     | NULL = Inherit from parent |

**The "XOR Parent" Constraint (`ck_item_parent_xor`):**
To ensure a clean menu tree, every item must belong to **exactly one** parent.
`CHECK ((category_id IS NOT NULL AND subcategory_id IS NULL) OR (category_id IS NULL AND subcategory_id IS NOT NULL))`

**Indexes:**

- `idx_items_is_bookable`: Used by the Booking Engine to identify services.

---

## 3. Pricing & Strategies

### 3.1 Pricing Configuration (`pricing`)

Implements the Strategy Pattern at the database level using a 1:1 relationship with items.

| Column        | Type  | Constraints          | Description                    |
| :------------ | :---- | :------------------- | :----------------------------- |
| id            | UUID  | PK                   | Unique identifier              |
| item_id       | UUID  | UNIQUE, FK (CASCADE) | Strict 1:1 coupling with Items |
| pricing_type  | ENUM  | NOT NULL             | static, tiered, dynamic        |
| configuration | JSONB | NOT NULL             | Strategy-specific payload      |

**Polymorphic JSONB Schemas:**

- **Static**: `{"base_price": number}`
- **Tiered**: `{"tiers": [{"max_quantity": number, "price": number}]}`
- **Dynamic**: `{"time_slots": [{"start_time": "HH:MM", "end_time": "HH:MM", "price": number}]}`

---

## 4. Booking & Availability Engine

### 4.1 Item Availability (`availability`)

Defines the operational windows for bookable services.

| Column      | Type    | Constraints   | Description                    |
| :---------- | :------ | :------------ | :----------------------------- |
| id          | UUID    | PK            |                                |
| item_id     | UUID    | FK (CASCADE)  |                                |
| day_of_week | INT     | 0-6 (Sun-Sat) | Target day                     |
| start_time  | TIME    | NOT NULL      | Format: HH:MM:SS               |
| end_time    | TIME    | NOT NULL      | Format: HH:MM:SS               |
| is_active   | BOOLEAN | DEFAULT true  | Soft delete for specific slots |

**Key Constraints:**

- `ck_valid_day_of_week`: Enforces range `0-6`.
- `ck_valid_time_range`: Ensures `end_time > start_time`.

### 4.2 Bookings (`bookings`)

The transactional record of all secured reservations.

| Column           | Type         | Constraints          | Description                             |
| :--------------- | :----------- | :------------------- | :-------------------------------------- |
| id               | UUID         | PK                   |                                         |
| item_id          | UUID         | FK (RESTRICT)        | Prevent item deletion if bookings exist |
| status           | ENUM         | confirmed, cancelled | `booking_status_type`                   |
| booking_time     | TIMESTAMPTZ  | NOT NULL             | UTC reservation start                   |
| duration_minutes | INT          | NOT NULL             | Length of service                       |
| customer_name    | VARCHAR(100) | NOT NULL             | Primary contact                         |
| customer_email   | VARCHAR(255) | NOT NULL             | Identification/Notifications            |

**Concurrency Protection:**

- **Database Level**: `UNIQUE(item_id, booking_time)` index prevents identical start-time collisions.
- **Service Level**: `BookingModel.createWithLock` utilizes PostgreSQL `FOR UPDATE` row-level locking to prevent overlapping window race conditions.

---

## 5. Customization (Add-ons)

### 5.1 Add-on Groups (`addon_groups`)

Business rules for item customization.

| Column        | Type         | Constraints   | Description                         |
| :------------ | :----------- | :------------ | :---------------------------------- |
| id            | UUID         | PK            |                                     |
| item_id       | UUID         | FK (CASCADE)  |                                     |
| name          | VARCHAR(100) | NOT NULL      | Display name (e.g., "Select Sauce") |
| is_required   | BOOLEAN      | DEFAULT false | UI helper for mandatory choice      |
| min_selection | INT          | NOT NULL      | Minimum items to select             |
| max_selection | INT          | NOT NULL      | Maximum items to select             |

**Key Constraints:**

- `ck_selection_logic`: Ensures `max_selection >= min_selection`.

### 5.2 Add-ons (`addons`)

Individual options within a group.

| Column         | Type          | Constraints  | Description                        |
| :------------- | :------------ | :----------- | :--------------------------------- |
| id             | UUID          | PK           |                                    |
| addon_group_id | UUID          | FK (CASCADE) |                                    |
| name           | VARCHAR(100)  | NOT NULL     | Option name (e.g., "Extra Garlic") |
| price          | DECIMAL(10,2) | NOT NULL     | Additional cost per unit           |
| is_active      | BOOLEAN       | DEFAULT true | Availability toggle                |
