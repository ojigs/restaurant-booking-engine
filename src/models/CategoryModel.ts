import { Category } from "@/types/entities";
import { BaseModel, PaginationParams, PaginatedResult } from "./BaseModel";

export interface CategoryFilters {
  is_active?: boolean;
}

export class CategoryModel extends BaseModel<Category> {
  protected readonly tableName = "categories";

  /**
   * find all categories that belongs to a particular restaurant with filter and pagination
   * @param restaurantId - uuid of the restaurant
   * @param filters - optional active/inactive filter
   * @param pagination - page, limit, and sorting params
   */
  async findByRestaurant(
    restaurantId: string,
    filters: CategoryFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Category>> {
    const query = this.db(this.tableName).where({
      restaurant_id: restaurantId,
    });

    // apply filters
    if (filters?.is_active !== undefined) {
      query.andWhere({ is_active: filters.is_active });
    }

    return this.paginate(query, pagination);
  }
  /**
   * check for name uniqueness within a restaurant
   * useful when creating and updating (using excludeId)
   *
   * @param restaurantId - uuid of the restaurant
   * @param name - the name to check
   * @param excludeId - optional ID to ignore (used during updates)
   * @returns boolean - true if name exists
   */
  async existsByName(
    restaurantId: string,
    name: string,
    excludeId?: string
  ): Promise<boolean> {
    const query = this.db(this.tableName)
      .where({ restaurant_id: restaurantId })
      .whereRaw("LOWER(name) = ?", [name.toLowerCase()])
      .first();

    if (excludeId) {
      query.whereNot("id", excludeId);
    }

    const result = await query;
    return !!result;
  }

  /**
   * fetch all active categories for a restaurant (for menu display)
   */
  async findActive(restaurantId: string): Promise<Category[]> {
    return this.db(this.tableName)
      .where({
        restaurant_id: restaurantId,
        is_active: true,
      })
      .orderBy("name", "asc");
  }
}
