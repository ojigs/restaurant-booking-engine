import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { BookingService } from "@/services/BookingService";

export class BookingController extends BaseController {
  constructor(private readonly bookingService: BookingService) {
    super();
  }

  /**
   * GET /bookings/slots/:itemId.
   * returns available time windows for a specific date
   */
  async getSlots(
    req: Request<{ itemId: string }>,
    res: Response
  ): Promise<Response> {
    const { itemId } = req.params;

    const date = req.query.date as string;

    const duration = req.query.duration ? Number(req.query.duration) : 60; // safe default to 60 minutes

    if (!date) {
      // defensive check for date param
      return res
        .status(400)
        .json({
          success: false,
          error: "Date parameter is required (YYYY-MM-DD)",
        });
    }

    const slots = await this.bookingService.getAvailableSlots(
      itemId,
      date,
      duration
    );

    return this.success(res, slots);
  }

  /**
   * POST /bookings
   */
  async create(req: Request, res: Response): Promise<Response> {
    const booking = await this.bookingService.createBooking(req.body);

    return this.created(res, booking);
  }
}
