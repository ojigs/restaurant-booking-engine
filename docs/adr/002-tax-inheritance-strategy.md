# ADR 002: Runtime Tax Resolution Hierarchy

- **Status**: Accepted
- **Date**: 2026-01-15
- **Author**: Emmanuel Ojighoro

## Context and Problem Statement

Tax percentages can be defined at the Category, Subcategory, or Item level. If a Category tax changes, all the children must inherit it unless they have specific override

## Considered Options

1. Store the effective tax on every item and update them all when a parent changes
2. Compute the effective tax during the read operation using SQL Joins or Application Logic

## Decision Outcome

Chosen Option: Compute the effective tax during read operation

### Consequences

- **Positive**:
  - No risk of outdated tax values on items
  - Updating a Category tax is a single row update, not an update of 1000+ items
- **Negative**:
  - Will require a `LEFT JOIN` on Category and Subcategory for every price fetch
- **Mitigation**: Use selective indexing on `category_id` and `subcategory_id`
