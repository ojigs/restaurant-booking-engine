import { Router } from "express";
import { pricingController } from "@/config/registry";

const router = Router();

/**
 * GET /api/v1/pricing/item/:id
 *
 * This is the live quote endpoint. It is called by the frontend
 * whenever a user changes a quantity or selects a time slot.
 * It allows the user to see the Grand Total (with tax) before
 * they hit the 'book' button
 */
router.get("/item/:id", pricingController.getQuote.bind(pricingController));

export default router;
