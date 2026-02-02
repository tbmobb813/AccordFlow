export type AgreementSignatureStatus =
  | 'DRAFT'
  | 'SENT'
  | 'SIGNED'
  | 'DECLINED'
  | 'CANCELED';

export interface Agreement {
  id: string;
  tenantId: string;
  opportunityId: string;
  proposalId: string;
  title: string;
  signatureStatus: AgreementSignatureStatus;
  sentAt?: string | null;
  signedAt?: string | null;
  signerName?: string | null;
  signerEmail?: string | null;
  providerId?: string | null;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AgreementListResponse = Agreement[];
