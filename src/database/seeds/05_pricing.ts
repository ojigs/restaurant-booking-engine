import { Knex } from "knex";
import { SEED_IDS } from "../support/seed-constants";
import { PricingType } from "../../types/enums";

export async function seed(knex: Knex): Promise<void> {
  await knex("pricing").insert([
    /**
     * Case 1: Static pricing
     */
    {
      id: knex.raw("gen_random_uuid()"),
      item_id: SEED_IDS.ITEM_PIZZA,
      pricing_type: PricingType.STATIC,
      configuration: JSON.stringify({
        base_price: 500.0,
      }),
    },

    /**
     * Case 2: Static pricing (high value item)
     */
    {
      id: knex.raw("gen_random_uuid()"),
      item_id: SEED_IDS.ITEM_WINE_BOTTLE,
      pricing_type: PricingType.STATIC,
      configuration: JSON.stringify({
        base_price: 2500.0,
      }),
    },

    /**
     * Case 3: Tiered pricing
     * Ror the Meeting Room. Prices drop/scale per unit.
     * Tier 1: 1 unit  -> ₹1000
     * Tier 2: 4 units -> ₹3500 (approx ₹875/unit)
     * Tier 3: 8 units -> ₹6000 (₹750/unit)
     */
    {
      id: knex.raw("gen_random_uuid()"),
      item_id: SEED_IDS.ITEM_MEETING_ROOM,
      pricing_type: PricingType.TIERED,
      configuration: JSON.stringify({
        tiers: [
          { max_quantity: 1, price: 1000.0 },
          { max_quantity: 4, price: 3500.0 },
          { max_quantity: 8, price: 6000.0 },
        ],
      }),
    },

    /**
     * Case 4: Dynamic pricing (time-based)
     * Used for the Happy Hour Drink.
     * Standard Price: ₹400
     * Happy Hour (17:00 - 20:00): ₹250
     */
    {
      id: knex.raw("gen_random_uuid()"),
      item_id: SEED_IDS.ITEM_HAPPY_HOUR_DRINK,
      pricing_type: PricingType.DYNAMIC,
      configuration: JSON.stringify({
        time_slots: [
          { start_time: "00:00", end_time: "17:00", price: 400.0 },
          { start_time: "17:00", end_time: "20:00", price: 250.0 },
          { start_time: "20:00", end_time: "23:59", price: 400.0 },
        ],
      }),
    },
  ]);

  console.log("Pricing strategies seeded");
}
