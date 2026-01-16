import z from "zod";
import { PricingStrategy } from "./PricingStrategy";
import {
  PriceCalculationParams,
  PriceResult,
  PricingValidationResult,
} from "@/types/pricing";
import { BusinessRuleError } from "@/utils/errors";

const tieredConfigSchema = z.object({
  tiers: z
    .array(
      z.object({
        max_quantity: z.number().int().positive(),
        price: z.number().min(0),
      })
    )
    .min(1, "At least one tier must be defined"),
});

export type TieredConfig = z.infer<typeof tieredConfigSchema>;

export class TieredPricing extends PricingStrategy {
  /**
   * find the right tier based on quantity
   */
  calculate(params: PriceCalculationParams): PriceResult {
    const config = tieredConfigSchema.parse(this.configuration);

    const quantity = params.quantity ?? 1; // default to 1 if not provided

    // sort tier by max_quantity ascending
    const sortedTiers = [...config.tiers].sort(
      (a, b) => a.max_quantity - b.max_quantity
    );

    const applicableTier = sortedTiers.find(
      (tier) => quantity <= tier.max_quantity
    );

    if (!applicableTier) {
      throw new BusinessRuleError(
        `Quantity ${quantity} exceeds the maximum supported tier of ${
          sortedTiers[sortedTiers.length - 1].max_quantity
        }`
      );
    }

    const price = Number(applicableTier.price);

    return {
      basePrice: price,
      discount: 0,
      finalPrice: price,
      appliedRule: `Tiered Pricing - Up to ${applicableTier.max_quantity} units`,
      metadata: {
        selectedTier: applicableTier,
        requestedQuantity: quantity,
      },
    };
  }

  /**
   * validate the tiered pricing configuration
   */
  validate(): PricingValidationResult {
    const result = tieredConfigSchema.safeParse(this.configuration);

    if (!result.success) {
      return {
        isValid: false,
        errors: result.error.issues.map(
          (e) => `${e.path.join(".")} : ${e.message}`
        ),
      };
    }

    // check for overlapping tiers, ie. those with duplicate max_quantity
    const tiers = result.data.tiers;
    const quantities = tiers.map((t) => t.max_quantity);
    const hasDuplicates = new Set(quantities).size !== quantities.length;

    if (hasDuplicates) {
      return {
        isValid: false,
        errors: ["Tiers have overlapping max_quantity values"],
      };
    }

    return { isValid: true, errors: [] };
  }
}
