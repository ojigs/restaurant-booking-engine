import z from "zod";
import { PricingStrategy } from "./PricingStrategy";
import {
  PriceCalculationParams,
  PriceResult,
  PricingValidationResult,
} from "@/types/pricing";

/**
 * zod schema for static pricing configuration
 */
const staticConfigSchema = z.object({
  base_price: z.number().min(0, "Basee price cannot be negative"),
});

export type StaticConfig = z.infer<typeof staticConfigSchema>;

export class StaticPricing extends PricingStrategy {
  /**
   * calculate the price based on static pricing
   */
  calculate(_params: PriceCalculationParams): PriceResult {
    const config = staticConfigSchema.parse(this.configuration);
    const price = Number(config.base_price);

    return {
      basePrice: price,
      discount: 0,
      finalPrice: price,
      appliedRule: "Static Pricing",
    };
  }

  /**
   * validate the static pricing configuration
   */
  validate(): PricingValidationResult {
    const result = staticConfigSchema.safeParse(this.configuration);

    if (!result.success) {
      return {
        isValid: false,
        errors: result.error.issues.map(
          (e) => `${e.path.join(".")} : ${e.message}`
        ),
      };
    }

    return { isValid: true, errors: [] };
  }
}
