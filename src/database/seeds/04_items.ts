import { Knex } from "knex";
import { SEED_IDS } from "../support/seed-constants";

export async function seed(knex: Knex): Promise<void> {
  await knex("items").insert([
    {
      id: SEED_IDS.ITEM_PIZZA,
      category_id: SEED_IDS.CAT_FOOD, // Direct Category Parent
      subcategory_id: null,
      name: "Margherita Pizza",
      description: "Classic tomato, mozzarella, and basil",
      // resolves to 5% from food category
      tax_applicable: null,
      tax_percentage: null,
      is_bookable: false,
      is_active: true,
    },
    {
      id: SEED_IDS.ITEM_WINE_BOTTLE,
      category_id: null,
      subcategory_id: SEED_IDS.SUB_WINE, // Subcategory Parent
      name: "Chianti Classico",
      description: "Vintage 2019 Red Wine",
      // should resolve to 20% from fine wines subcategory
      tax_applicable: null,
      tax_percentage: null,
      is_bookable: false,
      is_active: true,
    },
    {
      id: SEED_IDS.ITEM_MEETING_ROOM,
      category_id: SEED_IDS.CAT_SERVICES,
      subcategory_id: null,
      name: "Executive Meeting Room",
      description: "8-person room with 4K display",
      // this will inherit 18% from services category
      tax_applicable: null,
      tax_percentage: null,
      is_bookable: true, // service item
      is_active: true,
    },
    {
      id: SEED_IDS.ITEM_HAPPY_HOUR_DRINK,
      category_id: null,
      subcategory_id: SEED_IDS.SUB_CRAFT_BEER,
      name: "Pale Ale (Happy Hour)",
      description: "Special tax-free promotional drink",
      // direct override of 0% ignoring the inherited 10% from beverages
      tax_applicable: true,
      tax_percentage: 0.0,
      is_bookable: false,
      is_active: true,
    },
  ]);

  console.log("Items seeded");
}
