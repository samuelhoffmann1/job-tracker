export interface Job {
  id: number;
  title: string;
  company: string;
  url: string;
  location: string;
  min_salary: number | null;
  max_salary: number | null;
  feeling: string | null;
  status: string;
  applied_date: string;
  rating: number;
  date_posted: string;
  owner_id: number;
}

export type SortField = 'company' | 'rating' | 'applied_date' | null;
export type SortDirection = 'asc' | 'desc';