export type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export interface Proposal {
  id: string;
  tenantId: string;
  opportunityId: string;
  title: string;
  totalAmount: string;
  currency: string;
  status: ProposalStatus;
  sentAt?: string | null;
  viewedAt?: string | null;
  respondedAt?: string | null;
  expiresAt?: string | null;
  content?: Record<string, any> | null;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProposalListResponse = Proposal[];
