import { Knex } from "knex";
import { ADDON_GROUP_IDS, SEED_IDS } from "../support/seed-constants";

export async function seed(knex: Knex): Promise<void> {
  await knex("addon_groups").insert([
    {
      id: ADDON_GROUP_IDS.PIZZA_CRUST,
      item_id: SEED_IDS.ITEM_PIZZA,
      name: "Choose Your Crust",
      is_required: true,
      min_selection: 1,
      max_selection: 1,
    },
    {
      id: ADDON_GROUP_IDS.PIZZA_TOPPINGS,
      item_id: SEED_IDS.ITEM_PIZZA,
      name: "Extra Toppings",
      is_required: false,
      min_selection: 0,
      max_selection: 5,
    },
    {
      id: ADDON_GROUP_IDS.MEETING_TECH,
      item_id: SEED_IDS.ITEM_MEETING_ROOM,
      name: "Technical Add-ons",
      is_required: false,
      min_selection: 0,
      max_selection: 2,
    },
  ]);

  console.log("Add-on groups seeded");
}
