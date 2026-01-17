import { Knex } from "knex";
import { SEED_IDS } from "../support/seed-constants";
import { BookingStatus } from "../../types/enums";

export async function seed(knex: Knex): Promise<void> {
  const nextMonday = new Date();
  nextMonday.setDate(
    nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7)
  );
  nextMonday.setUTCHours(10, 0, 0, 0); // 10am UTC

  await knex("bookings").insert([
    {
      id: knex.raw("gen_random_uuid()"),
      item_id: SEED_IDS.ITEM_MEETING_ROOM,
      booking_time: nextMonday.toISOString(),
      duration_minutes: 60, // booked from 10am to 11am
      status: BookingStatus.CONFIRMED,
      customer_name: "Emmanuel Ojighoro",
      customer_email: "emmanuel@guestara.com",
    },
  ]);

  console.log(
    `Seeded a conflicting booking for ${
      nextMonday.toISOString().split("T")[0]
    } at 10:00 AM`
  );
}
