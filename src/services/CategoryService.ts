import { CategoryModel } from "@/models/CategoryModel";
import { SubcategoryModel } from "@/models/SubCategoryModel";
import { ItemModel } from "@/models/ItemModel";
import { Category } from "@/types/entities";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/validators";
import { PaginationParams, PaginatedResult } from "@/models/BaseModel";
import { ConflictError, NotFoundError } from "@/utils/errors";
import db from "@/config/database";

export class CategoryService {
  constructor(
    private readonly categoryModel: CategoryModel,
    private readonly subcategoryModel: SubcategoryModel,
    private readonly itemModel: ItemModel
  ) {}

  /**
   * Creates a new category.
   * requirement:  name must be unique within a restaurant's scope (case-insensitive)
   */
  async create(data: CreateCategoryDTO): Promise<Category> {
    const exists = await this.categoryModel.existsByName(
      data.restaurant_id,
      data.name
    );

    if (exists) {
      throw new ConflictError(
        `Category with name "${data.name}" already exists for this restaurant`
      );
    }

    return this.categoryModel.create(data);
  }

  /**
   * lists categories with pagination and sorting
   */
  async list(
    restaurantId: string,
    pagination: PaginationParams,
    activeOnly = true
  ): Promise<PaginatedResult<Category>> {
    return this.categoryModel.findByRestaurant(
      restaurantId,
      { is_active: activeOnly },
      pagination
    );
  }

  /**
   * Gets a single category
   */
  async getById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundError("Category");
    }
    return category;
  }

  /**
   * Updates a category
   */
  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const category = await this.getById(id);

    // check for conflicts with other categories if the name is being updated
    if (data.name && data.name.toLowerCase() !== category.name.toLowerCase()) {
      const exists = await this.categoryModel.existsByName(
        category.restaurant_id,
        data.name,
        id // exclude current id from the check
      );

      if (exists) {
        throw new ConflictError(
          `Another category with name "${data.name}" already exists`
        );
      }
    }

    return this.categoryModel.update(id, data);
  }

  /**
   * Deletes (soft delete) a category and deactivates related subcategories and items
   */
  async delete(id: string): Promise<void> {
    await db.transaction(async (trx) => {
      const affected = await this.categoryModel.softDelete(id, trx);

      if (affected === 0) {
        throw new NotFoundError("Category");
      }

      await this.subcategoryModel.deactivateByCategoryId(id, trx);
      await this.itemModel.deactivateByParentCategory(id, trx);
    });
  }
}
