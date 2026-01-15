import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add-on groups table
  await knex.schema.createTable("addon_groups", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("item_id")
      .notNullable()
      .references("id")
      .inTable("items")
      .onDelete("CASCADE");

    table.string("name", 100).notNullable();
    table.boolean("is_required").notNullable().defaultTo(false);
    table.integer("min_selection").notNullable().defaultTo(0);
    table.integer("max_selection").notNullable().defaultTo(1);

    table.timestamps(true, true);

    table.index("item_id");
  });

  // Add-ons table
  await knex.schema.createTable("addons", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("addon_group_id")
      .notNullable()
      .references("id")
      .inTable("addon_groups")
      .onDelete("CASCADE");

    table.string("name", 100).notNullable();
    table.decimal("price", 10, 2).notNullable().defaultTo(0.0);
    table.boolean("is_active").notNullable().defaultTo(true);

    table.timestamps(true, true);

    table.index("addon_group_id");
  });

  // selection logic constraint for addon_groups
  await knex.raw(`
    ALTER TABLE addon_groups 
    ADD CONSTRAINT ck_selection_logic 
    CHECK (max_selection >= min_selection AND min_selection >= 0)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("addons");
  await knex.schema.dropTableIfExists("addon_groups");
}
