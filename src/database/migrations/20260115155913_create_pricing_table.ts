import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // pricing strategy enum
  await knex.schema.raw(`
        CREATE TYPE pricing_strategy_type AS ENUM (
            'static',
            'tiered',
            'complimentary',
            'discounted',
            'dynamic'
        );
    `);

  await knex.schema.createTable("pricing", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    // one-to-one relationship with items
    table
      .uuid("item_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("items")
      .onDelete("CASCADE");
    table.specificType("pricing_type", "pricing_strategy_type").notNullable();

    /**
     * configuration: JSONB
     * Stores strategy-specific data (tiers, time slots, etc.)
     * JSONB is preferred over JSON because it is stored in a decomposed
     * binary format, allowing for indexing and faster processing.
     */
    table.jsonb("configuration").notNullable();

    table.timestamps(true, true);

    // indexes
    table.index("pricing_type");
  });
}

export async function down(knex: Knex): Promise<void> {
  // drop the table and the custom enum type
  await knex.schema.dropTableIfExists("pricing");
  await knex.schema.raw(`DROP TYPE IF EXISTS pricing_strategy_type;`);
}
