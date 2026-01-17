import { DynamicPricing } from "@/strategies/DynamicPricing";
import { BusinessRuleError } from "@/utils/errors";

describe("DynamicPricing Strategy", () => {
  const mockConfig = {
    time_slots: [
      { start_time: "08:00", end_time: "11:00", price: 150 }, // Breakfast
      { start_time: "12:00", end_time: "14:00", price: 500 }, // Lunch
      { start_time: "17:00", end_time: "20:00", price: 300 }, // Happy Hour
    ],
  };

  const strategy = new DynamicPricing(mockConfig);

  it("should return the correct price for a morning slot (09:30)", () => {
    const result = strategy.calculate({ requestTime: "09:30" });
    expect(result.finalPrice).toBe(150);
    expect(result.appliedRule).toContain("08:00 to 11:00");
  });

  it("should return the correct price for an evening slot (18:00)", () => {
    const result = strategy.calculate({ requestTime: "18:00" });
    expect(result.finalPrice).toBe(300);
    expect(result.appliedRule).toContain("17:00 to 20:00");
  });

  it("should throw BusinessRuleError for a time between slots (11:30)", () => {
    // 11:30 is between Breakfast (11:00) and Lunch (12:00)
    expect(() => {
      strategy.calculate({ requestTime: "11:30" });
    }).toThrow(BusinessRuleError);
  });

  it("should handle boundary: inclusive of start time (12:00)", () => {
    const result = strategy.calculate({ requestTime: "12:00" });
    expect(result.finalPrice).toBe(500);
  });

  it("should handle boundary: exclusive of end time (14:00)", () => {
    // 14:00 should not match the 12:00-14:00 slot
    expect(() => {
      strategy.calculate({ requestTime: "14:00" });
    }).toThrow(BusinessRuleError);
  });

  it("should fail validation if end_time is before start_time", () => {
    const invalidStrategy = new DynamicPricing({
      time_slots: [{ start_time: "18:00", end_time: "10:00", price: 100 }],
    });
    const validation = invalidStrategy.validate();
    console.log("validation :", validation);
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain(
      "End time 10:00 must be after start time 18:00"
    );
  });
});
