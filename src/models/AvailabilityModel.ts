import { BaseModel } from "./BaseModel";
import { Availability } from "@/types/entities";

export class AvailabilityModel extends BaseModel<Availability> {
  protected readonly tableName = "availability";

  /**
   * fetches all active availability rules for an item
   * (can be used to generate the initial availability schedule)
   */
  async findByItem(itemId: string): Promise<Availability[]> {
    return this.db(this.tableName)
      .where({
        item_id: itemId,
        is_active: true,
      })
      .orderBy("day_of_week", "asc")
      .orderBy("start_time", "asc");
  }

  /**
   * checks if a specific time falls within any active availability window for an item
   *
   * @param itemId
   * @param dayOfWeek - 0-6
   * @param time - HH:MM format
   */
  async isAvailable(
    itemId: string,
    dayOfWeek: number,
    time: string
  ): Promise<boolean> {
    const result = await this.db(this.tableName)
      .where({
        item_id: itemId,
        day_of_week: dayOfWeek,
        is_active: true,
      })
      .andWhere("start_time", "<=", time)
      .andWhere("end_time", ">", time)
      .first();

    return !!result;
  }

  /**
   * check to prevent overlapping time slots during creation/update
   */
  async checkOverlap(
    itemId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    const query = this.db(this.tableName)
      .where({
        item_id: itemId,
        day_of_week: dayOfWeek,
        is_active: true,
      })
      .andWhere((builder) => {
        builder.where((inner) => {
          inner
            .where("start_time", "<", endTime)
            .andWhere("end_time", ">", startTime);
        });
      });

    if (excludeId) {
      query.whereNot("id", excludeId);
    }

    const overlap = await query.first();
    return !!overlap;
  }
}
