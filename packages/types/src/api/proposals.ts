export interface Proposal {
  id: string;
  tenantId: string;
  opportunityId: string;
  title: string;
  content?: string | null;
  totalAmount: string;
  status: string;
  validUntil?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProposalListResponse = Proposal[];
