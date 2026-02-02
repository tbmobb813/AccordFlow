export interface Agreement {
  id: string;
  tenantId: string;
  proposalId: string;
  title: string;
  content?: string | null;
  status: string;
  signedAt?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AgreementListResponse = Agreement[];
