# API Contract v1.0.0

## Base URL

`http://localhost:4000/api/v1`

## Standard Response Format

Every response follows the `ApiResponse<T>` structure.

**Success Response**

```json
{
  "success": true,
  "data": {
    /* ... */
  }
}
```

**Error Response**

```json
{
  "success": false,
  "error": {
    "message": "Human readable message",
    "code": "ERROR_CODE",
    "details": [{ "field": "email", "message": "Invalid email address" }],
    "stack": "..." // only in development mode
  }
}
```

---

1. Categories

### List Categories for a Restaurant

`GET /categories/restaurant/:restaurantId`

Query Parameters:

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `sort` (string: name, createdAt, default: createdAt)
- `order` (string: asc, desc, default: desc)

Response:

- Returns a paginated list of categories belonging to the specified restaurant ID.

### Create Category

`POST /categories`

Body:

```json
{
  "restaurant_id": "uuid",
  "name": "string",
  "description": "string (optional)",
  "tax_applicable": true,
  "tax_percentage": 5.0
}
```

Business Rules:

- Name must be unique within the restaurant (case-insensitive).
- Tax percentage must be provided if tax is applicable.

### Update Category

`PUT /categories/:id`

- Partial update supported. If name is changed, uniqueness is re-validated.

### Delete Category (Soft Delete)

`DELETE /categories/:id`

Behavior:

- Deactivates the category and cascades deactivation to all linked subcategories and items to ensure data integrity.

---

2. Subcategories (Managed via Categories)

### List Subcategories

`GET /categories/:categoryId/subcategories`

> Note: route not yet available, but there is a foundation for it in the code.

---

3. Items

### Search/List Items

`GET /items`

**Advanced Query Parameters:**

- `query` (string): Searches `name` and `description` (case-insensitive).
- `minPrice` (number): Minimum price filter (calculated from JSONB configuration).
- `maxPrice` (number): Maximum price filter.
- `categoryId` (uuid): Filters items belonging to a Category or Subcategory.
- `taxApplicable` (boolean): Functional filter. Returns items that resolve to taxable status (local or inherited).
- `activeOnly` (boolean, default: true): Filter by soft-delete status.
- `page`, `limit`, `sort`, `order`: Standard pagination/sorting (supports sorting by `price`).

Response:

- Returns a paginated list of items. Virtual `price` column is calculated based on the item's primary pricing tier/base price.

### Create Item (Atomic Operation)

`POST /items`

**Body:**

```json
{
  "name": "string",
  "category_id": "uuid (optional)",
  "subcategory_id": "uuid (optional)",
  "description": "string (optional)",
  "tax_applicable": null,
  "tax_percentage": null,
  "is_bookable": true,
  "pricing": {
    "pricing_type": "static | tiered | dynamic",
    "configuration": {
      /* strategy specific config */
    }
  }
}
```

Business Rules & Logic:

- XOR Constraint: Must provide `category_id` OR `subcategory_id`, never both.
- Atomic Transaction: The Item and its Pricing Configuration are created in a single transaction. If pricing fails validation, the Item is not created.
- Strategy Validation: The configuration object is validated against the rules of the selected `pricing_type` (e.g., end_time > start_time for dynamic slots).

### Get Item Details (Hydrated View)

`GET /items/:id/details`

Query Parameters:

- `quantity` (number): For tiered pricing simulation.
- `requestTime` (string, HH:MM): For dynamic pricing simulation.

Response:

- Returns the static item data combined with a computed pricing object, including a full breakdown of the base price, applied rules, and the 3-tier resolved tax.

### Update Item

`PUT /items/:id`

- Supports partial updates. If `is_bookable` is changed to `false`, linked availability slots are automatically deactivated.

### Delete Item

`DELETE /items/:id`

- Performs a soft delete.

---

4. Pricing (Live Quote Engine)

### Get Live Pricing Quote

`GET /pricing/item/:id`

**Purpose:**

- A "pure view" endpoint for the frontend to calculate real-time totals as users interact with the UI (e.g., changing quantities or selecting time slots).

**Query Parameters:**

- `quantity` (number, default: 1): For tiered pricing logic.
- `requestTime` (string, HH:MM): For dynamic (time-based) pricing logic.
- `addonIds` (string, comma-separated): IDs of selected addons to include in the total.

**Response:**

```json
{
  "success": true,
  "data": {
    "basePrice": 1000,
    "discount": 0,
    "finalPrice": 1000,
    "appliedRule": "Tiered Pricing - Up to 1 units",
    "tax": {
      "applicable": true,
      "percentage": 18,
      "amount": 180
    },
    "grandTotal": 1180,
    "metadata": {
      /* strategy specific info */
    }
  }
}
```

---

5. Bookings (Service Reservations)

### Get Available Slots

`GET /bookings/slots/:itemId`

**Purpose:**

- Calculates free time windows by subtracting existing bookings from the item's operational availability windows.

Query Parameters:

- `date` (string, YYYY-MM-DD, required): The date to check.
- `duration` (number, default: 60): The length of the requested booking in minutes.

Logic:

- Generates slots at 30-minute start intervals.
- Automatically excludes slots that overlap with confirmed bookings.
- Excludes slots that would end after the item's closing time.
- Returns the dynamic price specific to each individual slot.

### Create Booking

`POST /bookings`

**Body:**

```json
{
  "item_id": "uuid",
  "booking_time": "ISO8601 string (UTC)",
  "duration_minutes": 60,
  "customer_name": "string",
  "customer_email": "string"
}
```

**Critical Business Rules:**

- Concurrency Protection: Uses PostgreSQL `FOR UPDATE` row-level locking. If two requests attempt to book overlapping windows simultaneously, the second will receive a `409 Conflict`.
- Future Only: `booking_time` must be in the future.
- Status: Defaults to `confirmed`.
