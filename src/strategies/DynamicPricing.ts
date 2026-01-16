import z from "zod";
import { PricingStrategy } from "./PricingStrategy";
import {
  PriceCalculationParams,
  PriceResult,
  PricingValidationResult,
} from "@/types/pricing";
import { BusinessRuleError } from "@/utils/errors";

const dynamicConfigSchema = z.object({
  time_slots: z
    .array(
      z.object({
        start_time: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM format"),
        end_time: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM format"),
        price: z.number().min(0, "Price cannot be negative"),
      })
    )
    .min(1, "At least one time slot must be defined"),
});

export type DynamicConfig = z.infer<typeof dynamicConfigSchema>;

export class DynamicPricing extends PricingStrategy {
  /**
   * calculate price based on time slots
   */
  calculate(params: PriceCalculationParams): PriceResult {
    const config = dynamicConfigSchema.parse(this.configuration);

    const requestTime =
      params.requestTime || new Date().toTimeString().slice(0, 5); // default to now

    const applicableSlot = config.time_slots.find((slot) => {
      return requestTime >= slot.start_time && requestTime < slot.end_time;
    });

    if (!applicableSlot) {
      throw new BusinessRuleError(
        `Item is not available at the time requested: ${requestTime}`
      );
    }

    const price = Number(applicableSlot.price);

    return {
      basePrice: price,
      discount: 0,
      finalPrice: price,
      appliedRule: `Dynamic Pricing - Time Slot ${applicableSlot.start_time} to ${applicableSlot.end_time}`,
      metadata: {
        slot: applicableSlot,
        requestTime,
      },
    };
  }

  validate(): PricingValidationResult {
    const result = dynamicConfigSchema.safeParse(this.configuration);

    if (!result.success) {
      return {
        isValid: false,
        errors: result.error.issues.map(
          (e) => `${e.path.join(".")} : ${e.message}`
        ),
      };
    }

    // check that end time is great than start time for all slots
    const invalidSlots = result.data.time_slots.filter((slot) => {
      return slot.end_time <= slot.start_time;
    });

    if (invalidSlots.length > 0) {
      return {
        isValid: false,
        errors: invalidSlots.map(
          (slot) =>
            `End time ${slot.end_time} must be after start time ${slot.start_time}`
        ),
      };
    }

    return { isValid: true, errors: [] };
  }
}
