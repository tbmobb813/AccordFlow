export interface Company {
  id: string;
  tenantId: string;
  name: string;
  website?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CompanyListResponse = Company[];
