import { PricingType } from "@/types/enums";
import { BaseModel } from "./BaseModel";
import { Pricing } from "@/types/entities";

export class PricingModel extends BaseModel<Pricing> {
  protected readonly tableName = "pricing";

  /**
   * fetches the pricing configuration for a specific item
   *
   * @param itemId - uuid of the item
   * @returns pricing configuration or null if not defined
   */
  async findByItem(itemId: string): Promise<Pricing | null> {
    const row = await this.db(this.tableName)
      .where({ item_id: itemId })
      .first();

    return row ? this.mapToEntity(row) : null;
  }

  /**
   * Explicit mapping to ensure database and entity interface matches
   */
  private mapToEntity(row: any): Pricing {
    return {
      id: row.id,
      item_id: row.item_id,
      pricing_type: row.pricing_type as PricingType,
      configuration:
        typeof row.configuration === "string"
          ? JSON.parse(row.configuration)
          : row.configuration,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
