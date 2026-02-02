export type OpportunityStatus =
  | 'OPEN'
  | 'WON'
  | 'LOST';

export interface Opportunity {
  id: string;
  tenantId: string;
  contactId: string;
  inquiryId?: string | null;
  pipelineId: string;
  stageId: string;
  name: string;
  valueEstimate?: string | null;
  currency: string;
  status: OpportunityStatus;
  closedAt?: string | null;
  expectedCloseDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityListResponse = Opportunity[];
