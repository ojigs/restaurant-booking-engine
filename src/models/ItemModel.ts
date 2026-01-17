import { BaseModel, PaginatedResult, PaginationParams } from "./BaseModel";
import { Item, ItemWithParents } from "@/types/entities";
import { NotFoundError } from "@/utils/errors";
import { Knex } from "knex";

export interface ItemWithPrice extends Item {
  price: number;
}

export interface ItemSearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  activeOnly?: boolean;
  taxApplicable?: boolean;
}

export class ItemModel extends BaseModel<Item> {
  protected readonly tableName = "items";

  /**
   * fetches an item with its parent (Category or Subcategory) tax info.
   * this uses the XOR logic - we left join both and the resolution logic
   * handles which one to use
   */
  async findWithParents(id: string): Promise<ItemWithParents | null> {
    const row = await this.db(this.tableName)
      .select(
        "items.*",
        "categories.tax_applicable as category_tax_applicable",
        "categories.tax_percentage as category_tax_percentage",
        "subcategories.tax_applicable as subcategory_tax_applicable",
        "subcategories.tax_percentage as subcategory_tax_percentage",
        // parent category of the subcategory for the 3rd tier
        "parent_cat.tax_applicable as sub_parent_tax_applicable",
        "parent_cat.tax_percentage as sub_parent_tax_percentage"
      )
      .leftJoin("categories", "items.category_id", "categories.id")
      .leftJoin("subcategories", "items.subcategory_id", "subcategories.id")
      .leftJoin(
        "categories as parent_cat",
        "subcategories.category_id",
        "parent_cat.id"
      )
      .where("items.id", id)
      .first();

    return row || null;
  }

  /**
   * reolves the effective tax for an item by checking item, subcategory, and category levels
   */
  async getEffectiveTax(
    id: string
  ): Promise<{ applicable: boolean; percentage: number }> {
    const item = await this.findWithParents(id);
    if (!item) throw new NotFoundError("Item");

    // check item level
    if (item.tax_applicable !== null) {
      return {
        applicable: item.tax_applicable,
        percentage: Number(item.tax_percentage ?? 0),
      };
    }

    // check subcategory level (if item belongs to subcategory)
    if (item.subcategory_id) {
      if (item.subcategory_tax_applicable !== null) {
        return {
          applicable: item.subcategory_tax_applicable,
          percentage: Number(item.subcategory_tax_percentage ?? 0),
        };
      }
      // if subcategory inherits, it looks at its own parent Category
      return {
        applicable: !!item.sub_parent_tax_applicable,
        percentage: Number(item.sub_parent_tax_percentage ?? 0),
      };
    }

    // check category level (if item belongs directly to that category)
    return {
      applicable: item.category_tax_applicable,
      percentage: Number(item.category_tax_percentage ?? 0),
    };
  }

  /**
   * search with full-text capability and price range filter
   * uses postgreSql JSON extraction for filtering price from pricing.configuration
   */
  async search(
    filters: ItemSearchFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<ItemWithPrice>> {
    const query = this.db(this.tableName)
      .select(
        "items.*",
        // extract price from JSONB as a numeric value
        this.db.raw(
          `CAST(
            COALESCE(
              pricing.configuration->>'base_price',
              pricing.configuration->'tiers'->0->>'price',
              pricing.configuration->'time_slots'->0->>'price'
            ) AS DECIMAL
          ) as price`
        )
      )
      .leftJoin("pricing", "items.id", "pricing.item_id")
      // joins for tax inheritance resolution
      .leftJoin("categories", "items.category_id", "categories.id")
      .leftJoin("subcategories", "items.subcategory_id", "subcategories.id")
      .leftJoin(
        "categories as sub_parent_cat",
        "subcategories.category_id",
        "sub_parent_cat.id"
      );

    // partial text search on name and description
    if (filters.query) {
      query.where((builder) => {
        builder
          .where("items.name", "ILIKE", `%${filters.query}%`)
          .orWhere("items.description", "ILIKE", `%${filters.query}%`);
      });
    }

    // category and subcategory filter
    if (filters.categoryId) {
      query.where((builder) => {
        builder
          .where("items.category_id", filters.categoryId)
          .orWhere("items.subcategory_id", filters.categoryId);
      });
    }

    // price range filter (using JSONB extraction)
    if (filters.minPrice !== undefined) {
      query.whereRaw(
        "CAST(pricing.configuration->>'base_price' AS DECIMAL) >= ?",
        [filters.minPrice]
      );
    }
    if (filters.maxPrice !== undefined) {
      query.whereRaw(
        "CAST(pricing.configuration->>'base_price' AS DECIMAL) <= ?",
        [filters.maxPrice]
      );
    }

    // status (active only) filter
    if (filters.activeOnly) {
      query.where("items.is_active", true);
    }

    /** tax_applicable filter
     * logic:
     * 1. use item.tax_applicable if set
     * 2. else if item belongs to subcategory, use subcategory.tax_applicable (or its parent category if null)
     * 3. else use category.tax_applicable
     */
    if (filters.taxApplicable !== undefined) {
      const effectiveTaxSql = `
      CASE 
        WHEN items.tax_applicable IS NOT NULL THEN items.tax_applicable
        WHEN items.subcategory_id IS NOT NULL THEN 
          COALESCE(subcategories.tax_applicable, sub_parent_cat.tax_applicable)
        ELSE categories.tax_applicable
      END
    `;

      query.whereRaw(`(${effectiveTaxSql}) = ?`, [filters.taxApplicable]);
    }

    return this.paginate(query, pagination);
  }

  /**
   * deactivates all items under a specific category (directly or through subcategories)
   * @param categoryId
   * @param trx
   */
  async deactivateByParentCategory(
    categoryId: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.getExecutor(trx)(this.tableName)
      .where({ category_id: categoryId })
      .orWhereIn("subcategory_id", function () {
        this.select("id")
          .from("subcategories")
          .where({ category_id: categoryId });
      })
      .update({ is_active: false, updated_at: new Date() });
  }
}
