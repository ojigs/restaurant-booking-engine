import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // custom ENUM type for booking status
  await knex.raw(`
    CREATE TYPE booking_status_type AS ENUM (
      'confirmed', 
      'cancelled'
    )
  `);

  await knex.schema.createTable("bookings", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("item_id")
      .notNullable()
      .references("id")
      .inTable("items")
      .onDelete("RESTRICT"); // dont allow deleting items with active bookings

    table
      .specificType("status", "booking_status_type")
      .notNullable()
      .defaultTo("confirmed");

    /**
     store the exact UTC point in time for the reservation
     */
    table.timestamp("booking_time", { useTz: true }).notNullable();

    table.integer("duration_minutes").notNullable();

    table.string("customer_name", 100).notNullable();
    table.string("customer_email", 255).notNullable();

    table.timestamps(true, true);

    // this ensures that the same item cannot have two bookings starting at the exact same time
    table.unique(["item_id", "booking_time"]);

    // indexes
    table.index("status");
    table.index("customer_email");
    table.index(["item_id", "booking_time"]);
  });

  // duration must be positive
  await knex.raw(`
    ALTER TABLE bookings 
    ADD CONSTRAINT ck_positive_duration 
    CHECK (duration_minutes > 0)
  `);
}

export async function down(knex: Knex): Promise<void> {
  // drop the table and the custom enum type
  await knex.schema.dropTableIfExists("bookings");
  await knex.raw("DROP TYPE IF EXISTS booking_status_type");
}
