import z from "zod";

/**
 * reusable schema for routes that take a single uuid 'id' parameter
 */
export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

/**
 * reusable schema for routes that take 'itemId'
 */
export const itemIdParamSchema = z.object({
  itemId: z.string().uuid("Invalid Item ID format"),
});
