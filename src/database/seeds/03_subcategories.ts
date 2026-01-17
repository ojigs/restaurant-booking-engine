import { Knex } from "knex";
import { SEED_IDS } from "../support/seed-constants";

export async function seed(knex: Knex): Promise<void> {
  await knex("subcategories").insert([
    {
      id: SEED_IDS.SUB_WINE,
      category_id: SEED_IDS.CAT_BEVERAGES,
      name: "Fine Wines",
      description: "Imported and local wines",
      // 20% tax for alcohol implies we will override the 10% from beverages
      tax_applicable: true,
      tax_percentage: 20.0,
      is_active: true,
    },
    {
      id: SEED_IDS.SUB_CRAFT_BEER,
      category_id: SEED_IDS.CAT_BEVERAGES,
      name: "Craft Beers",
      description: "Local brewery selections",
      // by setting it to null, we inherit the 10% tax from beverages
      tax_applicable: null,
      tax_percentage: null,
      is_active: true,
    },
  ]);

  console.log("Subcategories seeded");
}
