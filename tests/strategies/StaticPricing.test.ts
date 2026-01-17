import { StaticPricing } from "@/strategies/StaticPricing";

describe("StaticPricing Strategy", () => {
  const strategy = new StaticPricing({ base_price: 250 });

  it("should return the fixed price regardless of parameters", () => {
    const result = strategy.calculate({ quantity: 10, requestTime: "12:00" });
    expect(result.finalPrice).toBe(250);
    expect(result.appliedRule).toBe("Static Pricing");
  });

  it("should handle zero price (Complimentary-like)", () => {
    const freeStrategy = new StaticPricing({ base_price: 0 });
    const result = freeStrategy.calculate({});
    expect(result.finalPrice).toBe(0);
  });
});
