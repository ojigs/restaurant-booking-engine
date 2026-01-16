import { BaseModel, PaginatedResult, PaginationParams } from "./BaseModel";
import { Addon, AddonGroup, AddonGroupWithAddons } from "@/types/entities";

export class AddonGroupModel extends BaseModel<AddonGroup> {
  protected readonly tableName = "addon_groups";

  /**
   * fetches all addon groups for an item, including their individual addons
   *
   * @param itemId - uuid of the item
   */
  async findByItemWithAddons(itemId: string): Promise<AddonGroupWithAddons[]> {
    const groups: AddonGroup[] = await this.db(this.tableName)
      .where({ item_id: itemId })
      .orderBy("name", "asc");

    if (groups.length === 0) return [];

    const groupIds = groups.map((g) => g.id);

    const allAddons: Addon[] = await this.db("addons")
      .whereIn("addon_group_id", groupIds)
      .andWhere("is_active", true)
      .orderBy("name", "asc");

    return groups.map((group) => ({
      ...group,
      addons: allAddons
        .filter((addon) => addon.addon_group_id === group.id)
        .map((addon) => ({ ...addon, price: Number(addon.price) })),
    }));
  }

  /**
   * lists all addon groups for a particular item
   * supports pagination
   */
  async findAll(
    itemId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<AddonGroup>> {
    const query = this.db(this.tableName).where("item_id", itemId);

    return this.paginate(query, pagination);
  }
}
