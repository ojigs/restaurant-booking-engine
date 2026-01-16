# Pricing Engine Guide

The Pricing Engine determines an item's final price by combining a **Pricing Strategy** with **Tax Inheritance**

## Supported Strategies

### 1. Static Pricing

**Config**: `{"base_price": 200}`
**Behavior**: Always returns the base price.

### 2. Tiered Pricing

**Config**:

```json
{
  "tiers": [
    { "max_quantity": 1, "price": 300 },
    { "max_quantity": 2, "price": 500 },
    { "max_quantity": 4, "price": 800 }
  ]
}
```

**Behavior**: Selectes the first tier where params.quantity <= tier.max_quantity

- Throws BusinessRuleError(422) if quantity exceeds the highest tier

### 3. Dynamic Pricing (Time-based)

**Config:**

```json
{
  "time_slots": [{ "start_time": "08:00", "end_time": "11:00", "price": 199 }]
}
```

**Behavior:** Matches `params.requestTime` (HH:MM) against configured slots

- Throws `BusinessRuleError` (422) if the time falls outside all defined slots (Item Unavailable)

#### The Calculation Flow

- `PricingService` fetches the `pricing_type` from DB and instantiates the strategy
- Strategy runs its `calculate()` method
- **Tax Resolution:** `PricingService` calls `ItemModel.getEffectiveTax()` (resolving the 3-tier hierarchy, from item to subcategory to category)
- All financial results are rounded to 2 decimal places

#### Example Response Breakdown

```json
{
  "basePrice": 300,
  "discount": 0,
  "finalPrice": 300,
  "appliedRule": "Tiered pricing: Up to 1 units",
  "tax": {
    "applicable": true,
    "percentage": 5.0,
    "amount": 15.0
  },
  "grandTotal": 315.0
}
```
