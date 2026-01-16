import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "@/utils/errors";
import { ApiErrorResponse } from "@/types/responses";
import { config } from "@/config/env";

/**
 * Global Error Handler
 * Ensures all errors follow the ApiErrorResponse interface.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  void next;

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      message: err.message || "An unexpected error occurred",
    },
  };

  if (err instanceof AppError) {
    errorResponse.error.code = err.constructor.name;

    if (err instanceof ValidationError) {
      errorResponse.error.details = err.details;
    }

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // handle database driver errors
  if ("code" in err && err.code === "23505") {
    res.status(409).json({
      success: true,
      error: {
        message: "A resource with this name already exists",
        code: "ConflictError",
      },
    });
    return;
  }

  // log nexpected errors
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  if (config.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
  } else {
    errorResponse.error.message = "Internal Server Error";
  }

  res.status(500).json(errorResponse);
};
