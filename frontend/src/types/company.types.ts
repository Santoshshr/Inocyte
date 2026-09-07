export interface Industry {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: 'active' | 'upcoming' | 'archived';
  industry: string | null;
  industry_name: string | null;
  website_url: string;
  logo: string | null;
  display_order: number;
  is_featured: boolean;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
