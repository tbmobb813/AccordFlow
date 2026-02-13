export * from './api/companies';
export * from './api/contacts';
export * from './api/opportunities';
export * from './api/proposals';
export * from './api/agreements';
export * from './api/invoices';
export * from './api/payments';
export * from './api/activities';

export type UserId = string;

export interface UserProfile {
  id: UserId;
  name: string;
  email?: string;
}
