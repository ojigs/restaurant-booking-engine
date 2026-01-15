import { Knex } from "knex";
import { BaseModel } from "./BaseModel";
import { Booking } from "@/types/entities";
import { ConflictError } from "@/utils/errors";
import { BookingStatus } from "@/types/enums";

export class BookingModel extends BaseModel<Booking> {
  protected readonly tableName = "bookings";

  /**
   * Transactional booking creation with row-level locking
   *
   * @remarks
   * we lock the 'bookings' table for the specific item to prevent race conditions
   * where two users check availability at the exact same milisecond
   * and both think that the slot is free
   */
  async createWithLock(data: Partial<Booking>): Promise<Booking> {
    return this.db.transaction(async (trx: Knex.Transaction) => {
      // check for conflicts
      // we look for any confirmed booking that overlaps with the new request
      // duration_minutes is used to calculate the end of the existing bookings
      const bookingTime = data.booking_time as Date;
      const duration = data.duration_minutes as number;

      const endTime = new Date(bookingTime.getTime() + duration * 60000);

      const conflict = await trx(this.tableName)
        .where("item_id", data.item_id)
        .andWhere("status", BookingStatus.CONFIRMED)
        .andWhere((builder) => {
          builder
            .where((inner) => {
              // new booking starts during an existing booking
              inner
                .where("booking_time", "<=", bookingTime)
                .andWhereRaw(
                  "booking_time + (duration_minutes * interval '1 minute') > ?",
                  [bookingTime]
                );
            })
            .orWhere((inner) => {
              // existing booking starts during the new booking
              inner
                .where("booking_time", "<", endTime)
                .andWhere("booking_time", ">=", bookingTime);
            });
        })
        .forUpdate() // lock the rows
        .first();

      if (conflict) {
        throw new ConflictError(
          "The requested time slot overlaps with an existing booking"
        );
      }

      // insert the booking
      const [newBooking] = await trx(this.tableName)
        .insert({
          ...data,
          status: BookingStatus.CONFIRMED,
        })
        .returning("*");

      return newBooking;
    });
  }

  /**
   * find bookings for an item within a date range
   */
  async findInDateRange(
    itemId: string,
    start: Date,
    end: Date
  ): Promise<Booking[]> {
    return this.db(this.tableName)
      .where("item_id", itemId)
      .andWhere("status", BookingStatus.CONFIRMED)
      .andWhere("booking_time", ">=", start)
      .andWhere("booking_time", "<=", end)
      .orderBy("booking_time", "asc");
  }
}
