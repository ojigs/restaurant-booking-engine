import { Knex } from "knex";
import db from "@/config/database";

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export abstract class BaseModel<T extends { id: string }> {
  protected abstract readonly tableName: string;
  protected readonly db: Knex = db;

  /**
   * find a single record by id
   */
  async findById(id: string): Promise<T | null> {
    const row = await this.db(this.tableName).where({ id }).first();
    return row || null;
  }

  /**
   * create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const [record] = await this.db(this.tableName).insert(data).returning("*");
    return record;
  }

  /**
   * update a record by id
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const [record] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning("*");
    return record;
  }

  /**
   * soft delete (deactivate) a record by id
   */
  async softDelete(id: string): Promise<void> {
    await this.db(this.tableName)
      .where({ id })
      .update({ is_active: false, updated_at: new Date() });
  }

  // pagination helper
  protected async paginate<R = T>(
    query: Knex.QueryBuilder,
    params: PaginationParams
  ): Promise<PaginatedResult<R>> {
    const { page, limit, sort = "createdAt", order = "desc" } = params;

    const sortMap: Record<string, string> = {
      name: "name",
      createdAt: "created_at",
      price: "price",
    };

    const dbSortColumn = sortMap[sort] || "created_at";

    const countQuery = query
      .clone()
      .clearSelect()
      .clearOrder()
      .count("* as total")
      .first();
    const countResult = await countQuery;
    const total = parseInt((countResult?.total as string) || "0", 10);

    const data = await query
      .orderBy(dbSortColumn, order)
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data: data as R[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
