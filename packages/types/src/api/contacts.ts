export type ContactLifecycleStage =
  | 'LEAD'
  | 'QUALIFIED'
  | 'CLIENT'
  | 'ARCHIVED';

export interface Contact {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  lifecycleStage: ContactLifecycleStage;
  createdAt: string;
  updatedAt: string;
}

export type ContactListResponse = Contact[];
