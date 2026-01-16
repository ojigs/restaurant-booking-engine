import {
  PriceCalculationParams,
  PriceResult,
  PricingValidationResult,
} from "@/types/pricing";

/**
 * base for the strategy pattern
 */
export abstract class PricingStrategy {
  /**
   * @param configuration - JSONB object from the database
   */
  constructor(protected configuration: any) {}

  /**
   * calculates the price based on the strategy's rules
   */
  abstract calculate(params: PriceCalculationParams): PriceResult;

  /**
   * validates the configuration stored in the database
   */
  abstract validate(): PricingValidationResult;
}
