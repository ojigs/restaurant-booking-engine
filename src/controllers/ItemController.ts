import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { ItemService } from "@/services/ItemService";
import { ItemSearchFilters } from "@/models/ItemModel";
import { PaginationParams } from "@/models/BaseModel";

export class ItemController extends BaseController {
  constructor(private readonly itemService: ItemService) {
    super();
  }

  /**
   * POST /items
   * Expects both item data and pricing configuration in the body
   */
  async create(req: Request, res: Response): Promise<Response> {
    const { pricing, ...itemData } = req.body;
    const result = await this.itemService.create(itemData, pricing);
    return this.created(res, result);
  }

  /**
   * GET /items
   * supports filtering and searching
   */
  async search(req: Request, res: Response): Promise<Response> {
    const filters: ItemSearchFilters = {
      query: req.query.query as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      categoryId: req.query.categoryId as string,
      activeOnly: req.query.activeOnly === "true",
      taxApplicable:
        req.query.taxApplicable === "true"
          ? true
          : req.query.taxApplicable === "false"
          ? false
          : undefined,
    };

    const pagination: PaginationParams = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      sort: (req.query.sort as string) || "createdAt",
      order: (req.query.order as "asc" | "desc") || "desc",
    };

    const result = await this.itemService.search(filters, pagination);
    return this.success(res, result);
  }

  /**
   * GET /items/:id/details
   * @returns item + dynamic pricing + tax breakdown
   */
  async getDetails(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;
    const params = {
      quantity: req.query.quantity ? Number(req.query.quantity) : 1,
      requestTime: req.query.requestTime as string,
    };

    const result = await this.itemService.getDetails(id, params);
    return this.success(res, result);
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<Response> {
    await this.itemService.delete(req.params.id);
    return this.noContent(res);
  }
}
