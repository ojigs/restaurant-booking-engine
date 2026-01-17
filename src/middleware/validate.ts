import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ValidationError } from "@/utils/errors";

/**
 * reusable middleware to validate request body against a Zod schema
 */
export const validate: (
  schema: ZodType<any>,
  source?: "body" | "query" | "params"
) => (req: Request, _res: Response, next: NextFunction) => Promise<void> = (
  schema: ZodType<any>,
  source: "body" | "query" | "params" = "body"
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // parseAsync handles both sync and async operations (like DB checks)
      const validatedData = await schema.parseAsync(req[source]);

      if (source === "body") {
        req[source] = validatedData;
      } else {
        // update req.query or req.params in place
        const target = req[source];

        Object.keys(target).forEach((key) => {
          delete (target as any)[key];
        });

        Object.assign(target, validatedData);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // transform zod errors into the standard ApiErrorDetail format
        const details = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return next(
          new ValidationError(`${source} validation failed`, details)
        );
      }
      next(error);
    }
  };
};
