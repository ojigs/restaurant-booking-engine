import z from "zod";

const subcategoryCore = {
  name: z
    .string({ error: "Name must be a string" })
    .min(1, "Name is required")
    .max(100),
  image: z.url("Invalid image URL").nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  tax_applicable: z.boolean().nullable().default(null),
  tax_percentage: z.number().min(0).max(100).nullable().optional(),
};

export const createSubcategorySchema = z
  .object({
    category_id: z.string().uuid("Invalid category ID"),
    ...subcategoryCore,
  })
  .refine(
    (data) => {
      // if subcategory overrides tax to true, it must provide a percentage
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

export const updateSubcategorySchema = z
  .object(subcategoryCore)
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

export type CreateSubcategoryDTO = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryDTO = z.infer<typeof updateSubcategorySchema>;
