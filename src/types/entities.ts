import { BookingStatus, PricingType } from "./enums";

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

export interface Booking extends BaseEntity {
  item_id: string;
  customer_name: string;
  customer_email: string;
  booking_time: Date;
  duration_minutes: number;
  status: BookingStatus;
}

export interface AddonGroup extends BaseEntity {
  item_id: string;
  name: string;
  is_required: boolean;
  min_selection: number;
  max_selection: number;
}

export interface Addon extends BaseEntity {
  addon_group_id: string;
  name: string;
  price: number;
  is_active: boolean;
}

/**
 *  interface for API responses where we need the full list of addons under each group
 */
export interface AddonGroupWithAddons extends AddonGroup {
  addons: Addon[];
}
