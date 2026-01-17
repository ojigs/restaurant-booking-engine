import { Knex } from "knex";
import { SEED_IDS } from "../support/seed-constants";

export async function seed(knex: Knex): Promise<void> {
  const availabilityData = [];

  // seed availability for the meeting room (mon-fri, 09:00 - 18:00)
  for (let day = 1; day <= 5; day++) {
    availabilityData.push({
      id: knex.raw("gen_random_uuid()"),
      item_id: SEED_IDS.ITEM_MEETING_ROOM,
      day_of_week: day,
      start_time: "09:00:00", // hh:mm:ss
      end_time: "18:00:00",
      is_active: true,
    });
  }

  await knex("availability").insert(availabilityData);
  console.log("Availability windows seeded for Meeting Room");
}
