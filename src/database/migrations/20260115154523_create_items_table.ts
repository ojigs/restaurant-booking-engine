import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("items", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    // foreign keys: we make both nullable to support XOR logic
    table
      .uuid("category_id")
      .nullable()
      .references("id")
      .inTable("categories")
      .onDelete("CASCADE");
    table
      .uuid("subcategory_id")
      .nullable()
      .references("id")
      .inTable("subcategories")
      .onDelete("CASCADE");

    table.string("name", 150).notNullable();
    table.text("description").nullable();
    table.text("image").nullable();

    // tax inheritance strategy
    /**
     * tax_applicable:
     * true = override parent
     * false = tax exempt
     * null = inherit from Subcategory or Category table
     */
    table.boolean("tax_applicable").nullable();
    table.decimal("tax_percentage", 5, 2).nullable();

    table.boolean("is_active").notNullable().defaultTo(true);
    table.boolean("is_bookable").notNullable().defaultTo(false);
    table.timestamps(true, true);

    // indexes
    table.index("category_id");
    table.index("subcategory_id");
    table.index("is_active");
    table.index("is_bookable");
  });

  // XOR constriant to ensure item belongs to one parent only
  await knex.raw(`
        ALTER TABLE items
        ADD CONSTRAINT ck_item_parent_xor
        CHECK (
        (category_id IS NOT NULL AND subcategory_id IS NULL) OR
        (category_id IS NULL AND subcategory_id IS NOT NULL)
        )
    `);

  // business logic - tax percentage is required if tax_applicable is true
  await knex.raw(`
        ALTER TABLE items
        ADD CONSTRAINT ck_item_tax_percentage_required
        CHECK (
        (tax_applicable IS NOT TRUE) OR
        (tax_applicable = true AND tax_percentage IS NOT NULL)
        )
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("items");
}
