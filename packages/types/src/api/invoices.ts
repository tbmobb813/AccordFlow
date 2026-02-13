export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'VOID';

export interface Invoice {
  id: string;
  tenantId: string;
  opportunityId: string;
  agreementId: string;
  number: string;
  totalAmount: string;
  amountPaid: string;
  currency: string;
  dueDate?: string | null;
  status: InvoiceStatus;
  sentAt?: string | null;
  paidAt?: string | null;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceListResponse = Invoice[];
