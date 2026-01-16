import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ValidationError } from "@/utils/errors";

/**
 * reusable middleware to validate request body against a Zod schema
 */
export const validate = (schema: ZodType<any>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // parseAsync handles both sync and async operations (like DB checks)
      const validatedBody = await schema.parseAsync(req.body);

      req.body = validatedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // transform zod errors into the standard ApiErrorDetail format
        const details = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return next(new ValidationError("Validation failed", details));
      }
      next(error);
    }
  };
};
