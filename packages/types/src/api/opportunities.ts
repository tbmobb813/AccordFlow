export interface Opportunity {
  id: string;
  tenantId: string;
  contactId: string;
  title: string;
  description?: string | null;
  value?: string | null;
  stage: string;
  probability: number;
  expectedCloseDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityListResponse = Opportunity[];
