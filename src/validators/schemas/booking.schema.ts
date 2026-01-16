import z from "zod";

export const createBookingSchema = z.object({
  item_id: z.string().uuid("Invalid item ID"),
  booking_time: z.coerce
    .date()
    .refine((date) => date > new Date(), {
      message: "Booking time must be in the future",
    }),
  duration_minutes: z
    .number()
    .int()
    .min(15, "Minimum duration is 15 minutes")
    .max(480, "Maximum duration is 8 hours (480 minutes)"),
  customer_name: z.string().min(2, "Customer name is too short").max(100),
  customer_email: z.string().email("Invalid email address"),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;
