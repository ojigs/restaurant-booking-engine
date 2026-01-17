import { Knex } from "knex";
import { SEED_IDS } from "../support/seed-constants";

export async function seed(knex: Knex): Promise<void> {
  await knex("categories").insert([
    {
      id: SEED_IDS.CAT_FOOD,
      restaurant_id: SEED_IDS.RESTAURANT_ITALIAN,
      name: "Food",
      description: "Authentic Italian cuisine",
      tax_applicable: true,
      tax_percentage: 5.0,
      is_active: true,
    },
    {
      id: SEED_IDS.CAT_BEVERAGES,
      restaurant_id: SEED_IDS.RESTAURANT_ITALIAN,
      name: "Beverages",
      description: "Drinks and spirits",
      tax_applicable: true,
      tax_percentage: 10.0,
      is_active: true,
    },
    {
      id: SEED_IDS.CAT_SERVICES,
      restaurant_id: SEED_IDS.RESTAURANT_WORKSPACE,
      name: "Professional Services",
      description: "Bookable meeting rooms and desks",
      tax_applicable: true,
      tax_percentage: 18.0,
      is_active: true,
    },
  ]);

  console.log("Categories seeded");
}
