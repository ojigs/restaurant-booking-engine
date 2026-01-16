import z from "zod";

/**
 * shared base schema for Category fields
 */
const categoryBase = {
  name: z.string().min(1, "Name is required").max(100),
  image: z.url("Invalid image URL").nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  tax_applicable: z.boolean().default(false),
  tax_percentage: z.number().min(0).max(100).nullable().optional(),
};

/**
 * Schema for creating a category
 */
export const createCategorySchema = z
  .object({
    restaurant_id: z.uuid("Invalid restaurant ID"),
    ...categoryBase,
  })
  .refine(
    (data) => {
      // if tax is applicable, percentage MUST be provided
      if (data.tax_applicable === true) {
        return (
          data.tax_percentage !== null && data.tax_percentage !== undefined
        );
      }
      return true;
    },
    {
      message: "tax_percentage is required when tax_applicable is true",
      path: ["tax_percentage"],
    }
  );

/**
 * Schema for updating a Category
 */
export const updateCategorySchema = z
  .object({
    ...categoryBase,
  })
  .partial()
  .refine(
    (data) => {
      if (data.tax_applicable === true && data.tax_percentage === undefined) {
        return false;
      }
      return true;
    },
    {
      message: "tax_percentage must be provided when enabling tax_applicable",
      path: ["tax_percentage"],
    }
  );

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
