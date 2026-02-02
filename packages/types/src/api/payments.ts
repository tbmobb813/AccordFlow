export type PaymentStatus =
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentProvider =
  | 'STRIPE'
  | 'MANUAL'
  | 'OTHER';

export interface Payment {
  id: string;
  tenantId: string;
  opportunityId: string;
  invoiceId: string;
  provider: PaymentProvider;
  providerPaymentId?: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  succeededAt?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentListResponse = Payment[];
