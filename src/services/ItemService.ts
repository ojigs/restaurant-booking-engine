import { Knex } from "knex";
import db from "@/config/database";
import {
  ItemModel,
  ItemSearchFilters,
  ItemWithPrice,
} from "@/models/ItemModel";
import { PricingModel } from "@/models/PricingModel";
import { PricingService } from "@/services/PricingService";
import { AvailabilityModel } from "@/models/AvailabilityModel";
import { Item } from "@/types/entities";
import { CreateItemDTO, UpdateItemDTO, CreatePricingDTO } from "@/validators";
import { PaginationParams, PaginatedResult } from "@/models/BaseModel";
import { NotFoundError } from "@/utils/errors";
import { PriceResult } from "@/types/pricing";

export class ItemService {
  constructor(
    private readonly itemModel: ItemModel,
    private readonly pricingModel: PricingModel,
    private readonly pricingService: PricingService,
    private readonly availabilityModel: AvailabilityModel
  ) {}

  /**
   * creates an Item and its cricing configuration atomically
   */
  async create(
    itemData: CreateItemDTO,
    pricingData: Omit<CreatePricingDTO, "item_id">
  ): Promise<Item & { pricing: PriceResult }> {
    return db.transaction(async (trx: Knex.Transaction) => {
      const item = await this.itemModel.create(itemData, trx);

      // create the pricing configuration
      await this.pricingModel.create(
        {
          item_id: item.id,
          pricing_type: pricingData.pricing_type,
          configuration: pricingData.configuration,
        },
        trx
      );

      // since price is not stored, we compute initial price to return along with item
      const pricing = await this.pricingService.calculatePrice(item.id);

      return { ...item, pricing };
    });
  }

  /**
   * List/Search API
   */
  async search(
    filters: ItemSearchFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<ItemWithPrice>> {
    return this.itemModel.search(filters, pagination);
  }

  /**
   * fetches item details
   */
  async getDetails(
    id: string,
    params: { quantity?: number; requestTime?: string } = {}
  ): Promise<Item & { pricing: PriceResult }> {
    const item = await this.itemModel.findById(id);
    if (!item) throw new NotFoundError("Item");

    const pricing = await this.pricingService.calculatePrice(id, params);

    return { ...item, pricing };
  }

  /**
   * Updates an item. If is_bookable is being disabled.
   * it handles the cleanup of availability slots
   */
  async update(id: string, data: UpdateItemDTO): Promise<Item> {
    return db.transaction(async (trx: Knex.Transaction) => {
      const item = await this.itemModel.findById(id);
      if (!item) throw new NotFoundError("Item");

      // if item is no longer bookable, deactivate its availability
      if (item.is_bookable && data.is_bookable === false) {
        await this.availabilityModel.deactivateByItemId(id, trx);
      }

      return this.itemModel.update(id, data, trx);
    });
  }

  /**
   * Cascading Soft Delete for Items.
   * Handles pricing and availability as well
   */
  async delete(id: string): Promise<void> {
    await db.transaction(async (trx) => {
      const affected = await this.itemModel.softDelete(id, trx);
      if (affected === 0) throw new NotFoundError("Item");

      await this.availabilityModel.deactivateByItemId(id, trx);
    });
  }
}
