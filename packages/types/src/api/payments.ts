export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: string;
  status: string;
  method?: string | null;
  transactionId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentListResponse = Payment[];
