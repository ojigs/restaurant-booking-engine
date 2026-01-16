import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { CategoryService } from "@/services/CategoryService";
import { PaginationParams } from "@/models/BaseModel";

export class CategoryController extends BaseController {
  constructor(private readonly categoryService: CategoryService) {
    super();
  }

  /**
   * POST /categories
   */
  async create(req: Request, res: Response): Promise<Response> {
    const category = await this.categoryService.create(req.body);
    return this.created(res, category);
  }

  /**
   * GET /categories/restaurant/:restaurantId
   */
  async list(
    req: Request<{ restaurantId: string }>,
    res: Response
  ): Promise<Response> {
    const { restaurantId } = req.params;

    const pagination: PaginationParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: (req.query.sort as string) || "createdAt",
      order: (req.query.order as "asc" | "desc") || "desc",
    };

    const activeOnly = req.query.activeOnly !== "false";

    const result = await this.categoryService.list(
      restaurantId,
      pagination,
      activeOnly
    );
    return this.success(res, result);
  }

  /**
   * GET /categories/:id
   */
  async getById(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;
    const category = await this.categoryService.getById(id);
    return this.success(res, category);
  }

  /**
   * PUT /categories/:id
   */
  async update(req: Request<{ id: string }>, res: Response): Promise<Response> {
    const { id } = req.params;
    const category = await this.categoryService.update(id, req.body);
    return this.success(res, category);
  }

  /**
   * DELETE /categories/:id
   */
  async delete(req: Request<{ id: string }>, res: Response): Promise<Response> {
    const { id } = req.params;
    await this.categoryService.delete(id);
    return this.noContent(res);
  }
}
