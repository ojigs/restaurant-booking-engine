import { PricingType } from "./enums";

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category extends BaseEntity {
  restaurant_id: string;
  name: string;
  image: string | null;
  description: string | null;
  tax_applicable: boolean;
  tax_percentage: number | null;
  is_active: boolean;
}

export interface Subcategory extends BaseEntity {
  category_id: string;
  name: string;
  image: string | null;
  description: string | null;
  tax_applicable: boolean | null; // null = inherit from category
  tax_percentage: number | null;
  is_active: boolean;
}

// extended interface to include parent category details
export interface SubcategoryWithCategory extends Subcategory {
  category_name: string;
  category_tax_applicable: boolean;
  category_tax_percentage: number | null;
}

export interface Item extends BaseEntity {
  category_id: string | null;
  subcategory_id: string | null;
  name: string;
  description: string | null;
  image: string | null;
  tax_applicable: boolean | null;
  tax_percentage: number | null;
  is_active: boolean;
  is_bookable: boolean;
}

export interface ItemWithParents extends Item {
  category_tax_applicable: boolean;
  category_tax_percentage: number | null;
  subcategory_tax_applicable: boolean | null;
  subcategory_tax_percentage: number | null;
  sub_parent_tax_applicable: boolean | null;
  sub_parent_tax_percentage: number | null;
}

export interface ItemSearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  activeOnly?: boolean;
  taxApplicable: boolean;
}

export interface Pricing extends BaseEntity {
  item_id: string;
  pricing_type: PricingType;
  configuration: Record<string, any>;
}

export interface Availability extends BaseEntity {
  item_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  is_active: boolean;
}
