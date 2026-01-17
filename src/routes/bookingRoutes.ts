import { Router } from "express";
import { bookingController } from "@/config/registry";
import { validate } from "@/middleware/validate";
import { createBookingSchema } from "@/validators";

const router = Router();

/**
 * GET /api/v1/bookings/slots/:itemId
 * Get available time slots for a specific item
 */
router.get(
  "/slots/:itemId",
  bookingController.getSlots.bind(bookingController)
);

/**
 * POST /api/v1/bookings
 * Reservation endpoint with transactional conflict prevention
 */
router.post(
  "/",
  validate(createBookingSchema),
  bookingController.create.bind(bookingController)
);

export default router;
