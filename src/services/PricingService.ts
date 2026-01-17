import { ItemModel } from "@/models/ItemModel";
import { PricingModel } from "@/models/PricingModel";
import { DynamicPricing } from "@/strategies/DynamicPricing";
import { PricingStrategy } from "@/strategies/PricingStrategy";
import { StaticPricing } from "@/strategies/StaticPricing";
import { TieredPricing } from "@/strategies/TieredPricing";
import { PricingType } from "@/types/enums";
import {
  PriceCalculationParams,
  PriceResult,
  TaxResult,
} from "@/types/pricing";
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from "@/utils/errors";
import { Knex } from "knex";

export class PricingService {
  /**
   * mapping of pricing types to their strategy classes
   */
  private readonly strategyMap: Record<
    PricingType,
    new (config: any) => PricingStrategy
  > = {
    [PricingType.STATIC]: StaticPricing,
    [PricingType.TIERED]: TieredPricing,
    [PricingType.DYNAMIC]: DynamicPricing,
    [PricingType.COMPLIMENTARY]: StaticPricing, // we use static pricing here for now pending when we implement complimentary logic
    [PricingType.DISCOUNTED]: StaticPricing, // we use static pricing here for now pending when we implement discounted logic
  };

  constructor(
    private readonly pricingModel: PricingModel,
    private readonly itemModel: ItemModel
  ) {}

  async calculatePrice(
    itemId: string,
    params: PriceCalculationParams = {},
    trx?: Knex.Transaction
  ): Promise<PriceResult> {
    // get the price configuration
    const pricing = await this.pricingModel.findByItem(itemId, trx);
    if (!pricing) {
      throw new NotFoundError(
        `Pricing configuration not found for item ID: ${itemId}`
      );
    }

    // determine the strategy class
    const StrategyClass = this.strategyMap[pricing.pricing_type];
    if (!StrategyClass) {
      throw new BusinessRuleError(
        `Pricing type '${pricing.pricing_type}' is not supported`
      );
    }

    const strategy = new StrategyClass(pricing.configuration);

    const priceDetails = strategy.calculate(params);

    // get the effective tax across the item, subcategory, category
    const taxInfo = await this.itemModel.getEffectiveTax(itemId, trx);

    let taxAmount = 0;
    if (taxInfo.applicable && priceDetails.finalPrice > 0) {
      taxAmount = Number(
        (priceDetails.finalPrice * (taxInfo.percentage / 100)).toFixed(2)
      );
    }

    const taxResult: TaxResult = {
      applicable: taxInfo.applicable,
      percentage: taxInfo.percentage,
      amount: taxAmount,
    };

    return {
      ...priceDetails,
      tax: taxResult,
      grandTotal: priceDetails.finalPrice + taxAmount,
    };
  }

  /**
   * validates a pricing configuration against its strategy rules
   */
  validateConfiguration(type: PricingType, configuration: any): void {
    const StrategyClass = this.strategyMap[type];

    if (!StrategyClass) {
      throw new BusinessRuleError(
        `Pricing strategy '${type}' is not supported.`
      );
    }

    const strategy = new StrategyClass(configuration);
    const result = strategy.validate();

    if (!result.isValid) {
      const details = result.errors.map((msg) => ({
        field: "pricing.configuration",
        message: msg,
      }));

      throw new ValidationError("Invalid pricing configuration", details);
    }
  }
}
