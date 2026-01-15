# Database Schema Design (v1.0.0)

## Overview

This system uses PostgreSQL to ensure ACID compliance for bookings. All temporal fields use `TIMESTAMPTZ`. Soft deletes are handled via `is_active` flags

## 1. Categories

| Column         | Type         | Constraints                            |
| :------------- | :----------- | :------------------------------------- |
| id             | UUID         | PK, Default: gen_random_uuid()         |
| restaurant_id  | UUID         | NOT NULL                               |
| name           | VARCHAR(100) | NOT NULL                               |
| image          | TEXT         | Nullable                               |
| description    | TEXT         | Nullable                               |
| tax_applicable | BOOLEAN      | NOT NULL, Default: false               |
| tax_percentage | DECIMAL(5,2) | Nullable, CHECK (tax_applicable logic) |
| is_active      | BOOLEAN      | Default: true                          |
| created_at     | TIMESTAMPTZ  | Default: now()                         |
| updated_at     | TIMESTAMPTZ  | Default: now()                         |

**Indexes**: `UNIQUE(restaurant_id, name)`, `INDEX(restaurant_id)`, `INDEX(is_active)`

## 2. Subcategories

| Column         | Type         | Constraints                          |
| :------------- | :----------- | :----------------------------------- |
| id             | UUID         | PK                                   |
| category_id    | UUID         | FK (categories.id) ON DELETE CASCADE |
| name           | VARCHAR(100) | NOT NULL                             |
| tax_applicable | BOOLEAN      | Nullable (NULL = Inherit)            |
| tax_percentage | DECIMAL(5,2) | Nullable                             |
| is_active      | BOOLEAN      | Default: true                        |

**Indexes**: `UNIQUE(category_id, name)`, `INDEX(category_id)`

## 3. Items

| Column         | Type         | Constraints                     |
| :------------- | :----------- | :------------------------------ |
| id             | UUID         | PK                              |
| category_id    | UUID         | FK (categories.id), Nullable    |
| subcategory_id | UUID         | FK (subcategories.id), Nullable |
| name           | VARCHAR(150) | NOT NULL                        |
| is_bookable    | BOOLEAN      | Default: false                  |
| tax_applicable | BOOLEAN      | Nullable (NULL = Inherit)       |
| tax_percentage | DECIMAL(5,2) | Nullable                        |

**Constraint**: XOR Parent `CHECK((category_id IS NULL) != (subcategory_id IS NULL))`

## 4. Pricing (Polymorphic)

| Column        | Type  | Constraints                                        |
| :------------ | :---- | :------------------------------------------------- |
| id            | UUID  | PK                                                 |
| item_id       | UUID  | FK (items.id), UNIQUE                              |
| pricing_type  | ENUM  | static, tiered, complimentary, discounted, dynamic |
| configuration | JSONB | NOT NULL (Validated via Zod)                       |

## 5. Availability (Service Slots)

| Column      | Type | Constraints                             |
| :---------- | :--- | :-------------------------------------- |
| id          | UUID | PK                                      |
| item_id     | UUID | FK (items.id)                           |
| day_of_week | INT  | 0-6 (Sun-Sat)                           |
| start_time  | TIME | NOT NULL                                |
| end_time    | TIME | NOT NULL, CHECK (end_time > start_time) |

## 6. Bookings

| Column           | Type        | Constraints          |
| :--------------- | :---------- | :------------------- |
| id               | UUID        | PK                   |
| item_id          | UUID        | FK (items.id)        |
| booking_time     | TIMESTAMPTZ | NOT NULL             |
| duration_minutes | INT         | > 0                  |
| status           | ENUM        | confirmed, cancelled |

**Indexes**: `UNIQUE(item_id, booking_time)`, `INDEX(status)`

## 7. Add-ons

**addon_groups**: `id`, `item_id`, `name`, `min_selection`, `max_selection`
**addons**: `id`, `addon_group_id`, `name`, `price` (DECIMAL)
