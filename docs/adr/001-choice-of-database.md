# ADR 001: Choice of PostgreSQL for the Booking & Menu Engine

- **Status**: Accepted
- **Date**: 2026-01-15
- **Author**: Emmanuel Ojighoro

## Context and Problem Statement

The system requires a hierarchical menu structure and a booking engine. One of our primary concerns is preventing double-bookings and ensuring the tax calculations remain consistent across thousands of items

## Decision Drivers

- **Consistency**: We don't want to have race conditions during booking
- **Data Integrity**: Items belong to categories/subcategories
- **Flexibility**: Pricing configurations vary by type

## Considered Options

1. MongoDB
2. PostgreSQL

## Decision Outcome

Chosen Option: **PostgreSQL**

### Consequences

- **Positive**:
  - Native support for transactions and row-level locking ensures zero double-bookings
  - Enables us to store different pricing configurations in a single column
  - Ensures data quality at the database level
- **Negative**:
  - Migrations are required for schema changes (managed via Knex).
