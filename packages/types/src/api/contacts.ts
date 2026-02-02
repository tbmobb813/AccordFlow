export interface Contact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactListResponse = Contact[];
