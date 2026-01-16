/**
 * Parameters required for price calculation
 * Not every strategy needs every parameter
 */
export interface PriceCalculationParams {
  quantity?: number; // For tiered
  requestTime?: string; // For dynamic (HH:MM)
  selectedAddonIds?: string[]; // For addon pricing
}

export interface TaxResult {
  applicable: boolean;
  percentage: number;
  amount: number;
}

export interface PriceResult {
  basePrice: number; // raw price before discounts/tiers
  discount: number; // amount subtracted (if any)
  finalPrice: number; // price after strategy rules, before tax
  appliedRule: string; // description for the UI
  tax?: TaxResult; // calculated tax details
  grandTotal?: number; // finalPrice + tax.amount
  metadata?: Record<string, unknown>;
}

/**
 * result of a strategy validation check
 */
export interface PricingValidationResult {
  isValid: boolean;
  errors: string[];
}
