import { Router } from "express";
import { itemController } from "@/config/registry";
import { validate } from "@/middleware/validate";
import {
  createItemSchema,
  updateItemSchema,
  itemSearchSchema,
} from "@/validators";
import { idParamSchema } from "@/validators/schemas/common.schema";

const router = Router();

/**
 * GET /api/v1/items
 */
router.get(
  "/",
  validate(itemSearchSchema, "query"),
  itemController.search.bind(itemController)
);

/**
 * POST /api/v1/items
 * Creates Item + Pricing Strategy configuration
 */
router.post(
  "/",
  validate(createItemSchema),
  itemController.create.bind(itemController)
);

/**
 * GET /api/v1/items/:id/details
 * fetches item with computed price and tax breakdown
 */
router.get(
  "/:id/details",
  validate(idParamSchema, "params"),
  itemController.getDetails.bind(itemController)
);

/**
 * PUT /api/v1/items/:id
 */
router.put(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateItemSchema),
  itemController.update.bind(itemController)
);

router.delete(
  "/:id",
  validate(idParamSchema, "params"),
  itemController.delete.bind(itemController)
);

export default router;
