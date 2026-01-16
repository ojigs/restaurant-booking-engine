import { BaseModel, PaginatedResult, PaginationParams } from "./BaseModel";
import { Addon } from "@/types/entities";

export interface AddonFilters {
  groupId?: string;
  isActive?: boolean;
}

export class AddonModel extends BaseModel<Addon> {
  protected readonly tableName = "addons";

  /**
   * lists all active addons in a particular group
   */
  async findByGroup(groupId: string, activeOnly = true): Promise<Addon[]> {
    const query = this.db(this.tableName).where("addon_group_id", groupId);

    if (activeOnly) {
      query.where("is_active", true);
    }

    const rows = await query.orderBy("name", "asc");
    return rows.map((row) => ({ ...row, price: Number(row.price) }));
  }

  /**
   * lists all addons with filters and pagination
   */
  async findAll(
    filters: AddonFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Addon>> {
    const query = this.db(this.tableName);

    if (filters.groupId) {
      query.where("addon_group_id", filters.groupId);
    }

    if (filters.isActive !== undefined) {
      query.where("is_active", filters.isActive);
    }

    return this.paginate(query, pagination);
  }
}
