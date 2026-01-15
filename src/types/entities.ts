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
