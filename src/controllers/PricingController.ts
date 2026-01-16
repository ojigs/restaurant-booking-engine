import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { PricingService } from "@/services/PricingService";

export class PricingController extends BaseController {
  constructor(private readonly pricingService: PricingService) {
    super();
  }

  /**
   * GET /pricing/item/:id
   * Calculates dynamic price quote for an item based on query parameters
   */
  async getQuote(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;

    const params = {
      quantity: req.query.quantity ? Number(req.query.quantity) : 1,
      requestTime: req.query.requestTime as string,
      selectedAddonIds: req.query.addonIds
        ? (req.query.addonIds as string).split(",")
        : undefined,
    };

    const quote = await this.pricingService.calculatePrice(id, params);

    return this.success(res, quote);
  }
}
