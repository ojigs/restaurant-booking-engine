import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

  await knex.schema.createTable("categories", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("restaurant_id").notNullable();
    table.string("name").notNullable();
    table.text("image").nullable();
    table.text("description").nullable();
    table.boolean("tax_applicable").notNullable().defaultTo(false);
    table.decimal("tax_percentage", 5, 2).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);

    // unique constraints
    table.unique(["restaurant_id", "name"]);

    // indexes
    table.index("restaurant_id");
    table.index("is_active");
  });

  // custom constrain check for tax logic
  // this ensures tax percentage is present if tax_applicable is true
  await knex.raw(`
    ALTER TABLE categories
    ADD CONSTRAINT ck_tax_percentage_required
    CHECK (
      (tax_applicable = false) OR
      (tax_applicable = true AND tax_percentage IS NOT NULL)
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("categories");
}
