import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("subcategories", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("category_id")
      .notNullable()
      .references("id")
      .inTable("categories")
      .onDelete("CASCADE");
    table.string("name", 100).notNullable();
    table.text("image").nullable();
    table.text("description").nullable();

    /**
     * tax_applicable:
     * true = override parent
     * false = tax exempt
     * null = inherit from Category table
     */
    table.boolean("tax_applicable").nullable();
    table.decimal("tax_percentage", 5, 2).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);

    // unique constraints
    table.unique(["category_id", "name"]);

    // indexes
    table.index("category_id");
  });

  await knex.raw(`
    ALTER TABLE subcategories
    ADD CONSTRAINT ck_sub_tax_percentage_required
    CHECK (
      (tax_applicable IS NOT TRUE) OR
      (tax_applicable = true AND tax_percentage IS NOT NULL)
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("subcategories");
}
