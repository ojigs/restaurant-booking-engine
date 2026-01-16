import { BaseModel } from "./BaseModel";
import { Addon } from "@/types/entities";

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
}
