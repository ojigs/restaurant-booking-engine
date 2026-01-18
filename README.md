# Restaurant Booking Engine (Menu & Services Management)

A TypeScript backend built to handle high-traffic bookings and flexible menu structures. It supports multi-tenant setups, dynamic pricing rules, and safe booking flows that prevent double reservations.

---

## Architecture & Design Patterns

The project follows a **Layered Architecture** approach to ensure a strict separation of concerns, in order for it to be maintainable and testable.

### 1. Strategy Pattern (Pricing Engine)

To handle distinct pricing models (Static, Tiered, Dynamic, Complimentary, Discounted) without multiple "if-else" blocks, the project implements the **Strategy Pattern**.

- **Open/Closed Principle**: New pricing types (e.g., Seasonal Surge) can be added by creating a new Strategy class without modifying the core `PricingService`.
- **Logic Isolation**: Each strategy encapsulates its own mathematical rules and Zod-based validation logic.

### 2. Service Layer Pattern

Acts as the "Orchestrator" of the business logic.

- **Atomic Operations**: Services manage database transactions (using Knex) to ensure that complex actions—like creating an item and its pricing simultaneously—succeed or fail as a single unit.
- **Dependency Injection**: Services are injected into controllers via a **Composition Root**, facilitating easy unit testing and mocking.

### 3. Repository/Model Pattern

The `BaseModel` provides a standardized interface for data access.

- **Generic Pagination**: Every list API supports type-safe pagination and sorting out of the box.
- **Transaction Propagation**: Models are designed to optionally accept a transaction object (`trx`), ensuring "read-after-write" visibility during complex operations.

### 4. Defensive Perimeter (Validation Layer)

Using **Zod 4.3.5**, every entry point (Body, Query, and URL Params) is strictly validated and coerced before reaching the business logic.

- **Discriminated Unions**: Used in the Pricing API to enforce different JSONB schemas based on the `pricing_type`.
- **Functional Filtering**: Search parameters are coerced into functional types (e.g., boolean strings to actual booleans).

---

## Project Structure

```text
src/
├── config/             # Environment (Zod) and DB configuration
├── controllers/        # HTTP Request handling & Response standardization
├── database/           # Migrations, Seeds, and Support constants
├── middleware/         # Global Error Handler & Validation Middleware
├── models/             # Data Access Layer (Repository Pattern)
├── routes/             # Versioned API route definitions (v1)
├── services/           # Core Business Logic & Orchestration
├── strategies/         # Polymorphic Pricing Logic (Strategy Pattern)
├── types/              # Centralized Interfaces & Enums
├── utils/              # Custom Error Classes & Async Helpers
└── validators/         # Zod Schemas & DTO Inference
tests/                  # Isolated logic unit tests (Jest)
```

---

## Key Technical Differentiators

1. Three-Tier Tax Inheritance

Tax resolution follows a hierarchical fallback: Item -> Subcategory -> Category. This is computed at runtime using optimized SQL joins, ensuring a single source of truth and preventing data desynchronization when a parent category's tax changes.

2. Transactional Booking Safety

To prevent double-bookings in high-traffic scenarios, the system utilizes PostgreSQL row-level locking (`FOR UPDATE`). The availability engine subtracts overlapping confirmed windows from the operational schedule within an atomic transaction, guaranteeing zero reservation conflicts.

---

## Tech Stack & Tools

- **Runtime**: Node.js (v20+ recommended)
- **Language**: TypeScript 5.9+ (Strict Mode)
- **Web Framework**: Express 5.2.1
- **Database**: PostgreSQL 15+
- **Query Builder**: Knex 3.1.0
- **Validation**: Zod 4.3.5
- **Testing**: Jest & ts-jest
- **Environment**: Docker (Postgres containerization)

---

## Local Setup & Installation

### 1. Prerequisites

- Node.js (v20 or higher)
- Docker & Docker Compose
- Git

### 2. Clone and Install

```bash
git clone https://github.com/ojigs/restaurant-booking-engine.git
cd restaurant-booking-engine
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root (copy example):

```bash
cp .env.example .env
```

Ensure `DATABASE_URL` matches your local or Docker credentials, for example:

```
DATABASE_URL=postgresql://postgres:password123@localhost:5432/restaurant_booking
```

### 4. Database Initialization (Docker)

Start PostgreSQL container:

```bash
docker-compose up -d
```

### 5. Migrations & Seed Data

Run migrations and seeds:

```bash
# Run all migrations
npm run migrate

# Populate seed data
npm run seed
```

### 6. Start Development Server

The server will run on `http://localhost:4000` with hot-reloading:

```bash
npm run dev
```

---

## Testing

Run unit tests:

```bash
npm test
```

---

## API Documentation

- A detailed API Contract including request/response examples and business rules can be found in [`docs/api-contract.md`](./docs/api-contract.md).
- Import [`postman_collection.json`](https://documenter.getpostman.com/view/21286135/2sBXVig9VL) for ready-to-use API requests.

---

## Reflections

### Three Things I Learned

1. The power of calculating totals at runtime: computing tax and totals when requested ensures changes (like tax updates) take effect immediately.
2. Databases can enforce business integrity via constraints and locking; using `FOR UPDATE` with transactions prevents race conditions for bookings.
3. Strict input validation (Zod) reduces downstream errors by ensuring consistent, typed data at service boundaries.

### Hardest Challenge: The "Double Booking" Race

**Problem**: Two users booking the last slot at the same millisecond can cause conflicting reservations.

**Solution**: Use `FOR UPDATE` row-level locking inside a transaction so the second request waits and fails with a `409 Conflict` if the slot is no longer available.

---

## Trade-offs

### What I chose NOT to implement and Why

1. Not all 5 pricing types — implemented 3 (static, tiered, dynamic) to focus on robust, well-tested patterns.
2. User authentication (login) — prioritized booking logic, pricing strategies, and database integrity.
3. Complex add-on constraints — I implemented add-ons basics but omitted detailed validation in favour of the core features.

---
