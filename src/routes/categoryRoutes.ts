import { Router } from "express";
import { categoryController } from "@/config/registry";
import { validate } from "@/middleware/validate";
import { createCategorySchema, updateCategorySchema } from "@/validators";
import { idParamSchema } from "@/validators/schemas/common.schema";

const router = Router();

/**
 * POST /api/v1/categories
 * Creates a new category. Validates mandatory tax percentage logic
 */
router.post(
  "/",
  validate(createCategorySchema),
  categoryController.create.bind(categoryController)
);

/**
 * GET /api/v1/categories/restaurant/:restaurantId
 * Lists all categories for a tenant restaurant
 * Supports query params: page, limit, sort, order, activeOnly
 */
router.get(
  "/restaurant/:restaurantId",
  categoryController.list.bind(categoryController)
);

/**
 * GET /api/v1/categories/:id
 * Fetches a single category by id
 */
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  categoryController.getById.bind(categoryController)
);

/**
 * PUT /api/v1/categories/:id
 * Updates category details
 */
router.put(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  categoryController.update.bind(categoryController)
);

/**
 * DELETE /api/v1/categories/:id
 * Performs a cascading soft-delete of category, its subcategories, and items
 */
router.delete("/:id", categoryController.delete.bind(categoryController));

export default router;
