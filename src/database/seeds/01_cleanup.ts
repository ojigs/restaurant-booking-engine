import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex.raw(
    "TRUNCATE TABLE categories, subcategories, items, pricing, availability, bookings, addon_groups, addons RESTART IDENTITY CASCADE"
  );

  console.log("Database cleaned. Starting fresh seed...");
}
