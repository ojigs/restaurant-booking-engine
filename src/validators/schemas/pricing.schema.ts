import z from "zod";
import { PricingType } from "@/types/enums";

const staticConfig = z.object({
  base_price: z.number().min(0, "Base price cannot be negative"),
});

const tieredConfig = z.object({
  tiers: z
    .array(
      z.object({
        max_quantity: z
          .number()
          .int()
          .positive("Max quantity must be a positive integer"),
        price: z.number().min(0, "Tier price cannot be negative"),
      })
    )
    .min(1, "At least one tier is required"),
});

const dynamicConfig = z.object({
  time_slots: z
    .array(
      z.object({
        start_time: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM format"),
        end_time: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM format"),
        price: z.number().min(0, "Slot price cannot be negative"),
      })
    )
    .min(1, "At least one time slot is required"),
});

/**
 * discriminated union for Pricing
 */
export const createPricingSchema = z.discriminatedUnion("pricing_type", [
  z.object({
    item_id: z.uuid(),
    pricing_type: z.literal(PricingType.STATIC),
    configuration: staticConfig,
  }),
  z.object({
    item_id: z.uuid(),
    pricing_type: z.literal(PricingType.TIERED),
    configuration: tieredConfig,
  }),
  z.object({
    item_id: z.uuid(),
    pricing_type: z.literal(PricingType.DYNAMIC),
    configuration: dynamicConfig,
  }),
  // complimentary and discounted pricing types can be added here in future
]);

/**
 * input schema used inside item creation
 */
export const itemPricingSchema = z.discriminatedUnion("pricing_type", [
  z.object({
    pricing_type: z.literal(PricingType.STATIC),
    configuration: staticConfig,
  }),
  z.object({
    pricing_type: z.literal(PricingType.TIERED),
    configuration: tieredConfig,
  }),
  z.object({
    pricing_type: z.literal(PricingType.DYNAMIC),
    configuration: dynamicConfig,
  }),
]);

export type CreatePricingDTO = z.infer<typeof createPricingSchema>;
