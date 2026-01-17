import { Router } from "express";
import categoryRoutes from "./categoryRoutes";
import itemRoutes from "./itemRoutes";
import pricingRoutes from "./pricingRoutes";
import bookingRoutes from "./bookingRoutes";

const router = Router();

router.use("/categories", categoryRoutes);
router.use("/items", itemRoutes);
router.use("/pricing", pricingRoutes);
router.use("/bookings", bookingRoutes);

export default router;
