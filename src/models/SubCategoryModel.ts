import { NotFoundError } from "@/utils/errors";
import { BaseModel, PaginatedResult, PaginationParams } from "./BaseModel";
import { Subcategory, SubcategoryWithCategory } from "@/types/entities";

export class SubcategoryModel extends BaseModel<Subcategory> {
  protected readonly tableName = "subcategories";

  /**
   * fetch a subcategory and join with the parent category
   */
  async findWithCategory(id: string): Promise<SubcategoryWithCategory | null> {
    const row = await this.db(this.tableName)
      .select(
        "subcategories.*",
        "categories.name as category_name",
        "categories.tax_applicable as category_tax_applicable",
        "categories.tax_percentage as category_tax_percentage"
      )
      .join("categories", "subcategories.category_id", "categories.id")
      .where("subcategories.id", id)
      .first();

    return row || null;
  }

  /**
   * lists all subcategories for a particular category
   */
  async findByCategory(
    categoryId: string,
    pagination: PaginationParams,
    activeOnly = true
  ): Promise<PaginatedResult<Subcategory>> {
    const query = this.db(this.tableName).where("category_id", categoryId);

    if (activeOnly) {
      query.where("is_active", true);
    }

    return this.paginate(query, pagination);
  }

  /**
   * Resolves the effective tax for a subcategory (priotizes subcategory and defaults to category)
   *
   * @returns tax info object containing application status and percentage
   */
  async getEffectiveTax(
    id: string
  ): Promise<{ applicable: boolean; percentage: number }> {
    const data = await this.findWithCategory(id);

    if (!data) {
      throw new NotFoundError("Subcategory");
    }

    // if subcategory has an explicit setting (true/false) else default to category
    const applicable =
      data.tax_applicable !== null
        ? data.tax_applicable
        : data.category_tax_applicable;

    const percentage =
      data.tax_applicable !== null
        ? data.tax_percentage ?? 0
        : data.category_tax_percentage ?? 0;

    return {
      applicable,
      percentage: Number(percentage),
    };
  }
}
