export interface Company {
  id: string;
  name: string;
  website?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CompanyListResponse = Company[];
