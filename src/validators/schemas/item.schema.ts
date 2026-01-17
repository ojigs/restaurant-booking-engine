import z from "zod";
import { itemPricingSchema } from "./pricing.schema";

const itemCore = {
  name: z.string().min(1, "Name is required").max(150),
  description: z.string().max(1000).nullable().optional(),
  image: z.url().nullable().optional(),
  tax_applicable: z.boolean().nullable().default(null),
  tax_percentage: z.number().min(0).max(100).nullable().optional(),
  is_bookable: z.boolean().default(false),
  category_id: z.uuid("Invalid category ID").nullable().optional(),
  subcategory_id: z
    .string()
    .uuid("Invalid subcategory ID")
    .nullable()
    .optional(),
};

export const createItemSchema = z
  .object({ ...itemCore, pricing: itemPricingSchema })
  .refine(
    (data) => {
      // item must have at least one parent (category or subcategory) but not both
      const hasCategory = !!data.category_id;
      const hasSubcategory = !!data.subcategory_id;
      return (
        (hasCategory || hasSubcategory) && !(hasCategory && hasSubcategory)
      );
    },
    {
      message:
        "Item must belong to either a category or a subcategory, not both",
      path: ["category_id"],
    }
  )
  .refine(
    (data) => {
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
 * Update item schema
 */
export const updateItemSchema = z
  .object(itemCore)
  .partial()
  .refine(
    (data) => {
      if (data.category_id !== undefined && data.subcategory_id !== undefined) {
        const hasCat = !!data.category_id;
        const hasSub = !!data.subcategory_id;
        return (hasCat || hasSub) && !(hasCat && hasSub);
      }
      return true;
    },
    {
      message:
        "Item must belong to either a category or a subcategory, not both",
      path: ["category_id"],
    }
  );

export const itemSearchSchema = z.object({
  query: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  categoryId: z.uuid().optional(),
  activeOnly: z.preprocess((val) => val === "true", z.boolean()).optional(),

  taxApplicable: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }, z.boolean().optional()),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateItemDTO = z.infer<typeof createItemSchema>;
export type UpdateItemDTO = z.infer<typeof updateItemSchema>;
export type ItemSearchDTO = z.infer<typeof itemSearchSchema>;
