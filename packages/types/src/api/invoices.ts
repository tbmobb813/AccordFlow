export interface Invoice {
  id: string;
  tenantId: string;
  agreementId: string;
  invoiceNumber: string;
  amount: string;
  status: string;
  dueDate: string;
  issuedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceListResponse = Invoice[];
