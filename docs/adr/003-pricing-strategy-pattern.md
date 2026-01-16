# ADR 003: Strategy Pattern for Polymorphic Pricing

- **Status**: Accepted
- **Date**: 2026-01-16
- **Author**: Emmanuel Ojighoro

## Context and Problem Statement

The system should support different pricing models (static, tiered, etc) for different types of items (Food vs. Services). If we hardcoded these into a single service, it would result in a large "if-else" or "switch" block which is unmaintainable

## Decision Drivers

- We should be able to add new pricing type without modifying the core PricingService
- Each pricing type has a unique JSONB configuration structure that requires strict validation
- The logic for each pricing type should be isolated and unit-testable

## Decision Outcome

Chosen Option: **Strategy Pattern**

### Implementation Details

- **PricingStrategy (Base)**: This defines the contract (`calculate`, `validate`)
- **Definite Strategies**: `StaticPricing`, `TieredPricing`, encapsulate the specific logic for each pricing type and their respective zod validation
- **PricingService (Context)**: Uses a factory-style mapping to instantiate the correct strategy

### Consequences

- **Positive**:
  - Adding a new type only requires us to add a new class and one map entry
  - Zod validation at the strategy level prevents malevolent DB data from causing runtime crashes
- **Negative**:
  - Small increase in boilerplate code (one file for each pricing strategy)
