import { Response } from "express";
import { ApiResponse } from "@/types/responses";

export abstract class BaseController {
  /**
   * Success response helper
   */
  protected success<T>(
    res: Response,
    data: T,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Helper for 201 created response
   */
  protected created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  /**
   * Helper for 204 no content response
   */
  protected noContent(res: Response): Response {
    return res.status(204).send();
  }
}
