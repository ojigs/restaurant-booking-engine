import { BookingModel } from "@/models/BookingModel";
import { AvailabilityModel } from "@/models/AvailabilityModel";
import { ItemModel } from "@/models/ItemModel";
import { PricingService } from "@/services/PricingService";
import { Booking } from "@/types/entities";
import { CreateBookingDTO } from "@/validators";
import { BusinessRuleError } from "@/utils/errors";
import { AvailableSlot } from "@/types/booking";

export class BookingService {
  constructor(
    private readonly bookingModel: BookingModel,
    private readonly availabilityModel: AvailabilityModel,
    private readonly itemModel: ItemModel,
    private readonly pricingService: PricingService
  ) {}

  /**
   * Calculates available time slots for a specific date
   *
   * @param itemId - The service ID
   * @param dateStr - Target date (YYYY-MM-DD)
   * @param durationMinutes - Required duration for the booking
   */
  async getAvailableSlots(
    itemId: string,
    dateStr: string,
    durationMinutes: number = 60
  ): Promise<AvailableSlot[]> {
    const item = await this.itemModel.findById(itemId);
    if (!item || !item.is_bookable || !item.is_active) {
      throw new BusinessRuleError("Item is not available for booking");
    }

    // determine day of week and range
    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getUTCDay();

    //fetch availability windows (opening hours)
    const windows = await this.availabilityModel.findByItem(itemId);
    const dayWindows = windows.filter((w) => w.day_of_week === dayOfWeek);

    if (dayWindows.length === 0) return [];

    // fetch existing bookings for that day
    const startOfDay = new Date(dateStr);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingBookings = await this.bookingModel.findInDateRange(
      itemId,
      startOfDay,
      endOfDay
    );

    // generate potential slots (uses sliding window algorithm)
    const availableSlots: AvailableSlot[] = [];

    for (const window of dayWindows) {
      let currentTime = this.parseTimeToDate(dateStr, window.start_time);
      const windowEnd = this.parseTimeToDate(dateStr, window.end_time);

      // increment by 30-minute intervals for slot start times
      while (
        new Date(currentTime.getTime() + durationMinutes * 60000) <= windowEnd
      ) {
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(
          currentTime.getTime() + durationMinutes * 60000
        );

        // check if there is an overlap with existing bookings
        const isOverlap = existingBookings.some((booking) => {
          const bookingStart = new Date(booking.booking_time);
          const bookingEnd = new Date(
            bookingStart.getTime() + booking.duration_minutes * 60000
          );
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });

        // check if slot is in the past
        const isPast = slotStart < new Date();

        if (!isOverlap && !isPast) {
          // integrates the pricing engine (handles dynamic/time-based prices)
          const priceDetails = await this.pricingService.calculatePrice(
            itemId,
            {
              requestTime: slotStart.toISOString().split("T")[1].slice(0, 5),
              quantity: 1, // default quantity for slot discovery
            }
          );

          availableSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            available: true,
            priceDetails,
          });
        }

        // increment by 30 mins to find next potential slot
        currentTime = new Date(currentTime.getTime() + 30 * 60000);
      }
    }

    return availableSlots;
  }

  /**
   * Creates a booking for an item
   */
  async createBooking(data: CreateBookingDTO): Promise<Booking> {
    const item = await this.itemModel.findById(data.item_id);
    if (!item?.is_bookable) {
      throw new BusinessRuleError("This item does not accept bookings");
    }

    // transactional lock to ensure no double-booking
    return this.bookingModel.createWithLock(data);
  }

  /**
   * helper function to convert "YYYY-MM-DD" and "HH:MM:SS" into a Date object
   */
  private parseTimeToDate(dateStr: string, timeStr: string): Date {
    return new Date(`${dateStr}T${timeStr}Z`);
  }
}
