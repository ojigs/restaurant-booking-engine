import { TieredPricing } from "@/strategies/TieredPricing";
import { BusinessRuleError } from "@/utils/errors";

describe("TieredPricing Strategy", () => {
  const mockConfig = {
    tiers: [
      { max_quantity: 1, price: 1000 },
      { max_quantity: 5, price: 4000 },
      { max_quantity: 10, price: 7500 },
    ],
  };

  const strategy = new TieredPricing(mockConfig);

  it("should select the first tier for quantity 1", () => {
    const result = strategy.calculate({ quantity: 1 });
    expect(result.finalPrice).toBe(1000);
    expect(result.appliedRule).toContain("Up to 1 units");
  });

  it("should select the correct middle tier (boundary check)", () => {
    // Quantity 3 is > 1 and <= 5
    const result = strategy.calculate({ quantity: 3 });
    expect(result.finalPrice).toBe(4000);
    expect(result.appliedRule).toContain("Up to 5 units");
  });

  it("should select the highest tier", () => {
    const result = strategy.calculate({ quantity: 10 });
    expect(result.finalPrice).toBe(7500);
  });

  it("should throw BusinessRuleError if quantity exceeds max tier", () => {
    expect(() => {
      strategy.calculate({ quantity: 11 });
    }).toThrow(BusinessRuleError);
  });

  it("should default to quantity 1 if no quantity is provided", () => {
    const result = strategy.calculate({});
    expect(result.finalPrice).toBe(1000);
  });

  it("should fail validation if tiers are missing", () => {
    const invalidStrategy = new TieredPricing({ tiers: [] });
    const validation = invalidStrategy.validate();
    expect(validation.isValid).toBe(false);
  });
});
