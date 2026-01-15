import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("availability", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("item_id")
      .notNullable()
      .references("id")
      .inTable("items")
      .onDelete("CASCADE");

    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    table.integer("day_of_week").notNullable();

    table.time("start_time").notNullable();
    table.time("end_time").notNullable();

    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);

    // indexes for availability lookups (for example, customer  wants all slots for an item on a specific day)
    table.index(["item_id", "day_of_week", "is_active"]);
  });

  // ensure day_of_week is within  the valid range of 0-6
  await knex.raw(`
    ALTER TABLE availability 
    ADD CONSTRAINT ck_valid_day_of_week 
    CHECK (day_of_week BETWEEN 0 AND 6)
  `);

  // ensure end_time is always after start_time
  await knex.raw(`
    ALTER TABLE availability 
    ADD CONSTRAINT ck_valid_time_range 
    CHECK (end_time > start_time)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("availability");
}
