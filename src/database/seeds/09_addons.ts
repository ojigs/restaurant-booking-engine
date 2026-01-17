import { Knex } from "knex";
import { ADDON_GROUP_IDS } from "../support/seed-constants";

export async function seed(knex: Knex): Promise<void> {
  await knex("addons").insert([
    // crusts for pizza
    {
      id: knex.raw("gen_random_uuid()"),
      addon_group_id: ADDON_GROUP_IDS.PIZZA_CRUST,
      name: "Thin Crust",
      price: 0.0,
      is_active: true,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      addon_group_id: ADDON_GROUP_IDS.PIZZA_CRUST,
      name: "Stuffed Crust",
      price: 150.0,
      is_active: true,
    },

    // toppings for pizza
    {
      id: knex.raw("gen_random_uuid()"),
      addon_group_id: ADDON_GROUP_IDS.PIZZA_TOPPINGS,
      name: "Extra Mozzarella",
      price: 80.0,
      is_active: true,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      addon_group_id: ADDON_GROUP_IDS.PIZZA_TOPPINGS,
      name: "Pepperoni",
      price: 120.0,
      is_active: true,
    },

    // tech for meeting room
    {
      id: knex.raw("gen_random_uuid()"),
      addon_group_id: ADDON_GROUP_IDS.MEETING_TECH, // referencing the tech group
      name: "Video Conferencing Kit",
      price: 500.0,
      is_active: true,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      addon_group_id: ADDON_GROUP_IDS.MEETING_TECH,
      name: "Whiteboard & Markers",
      price: 50.0,
      is_active: true,
    },
  ]);

  console.log("Individual Add-ons seeded");
}
