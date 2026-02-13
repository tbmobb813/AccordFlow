export type EntityType =
  | 'CONTACT'
  | 'INQUIRY'
  | 'OPPORTUNITY'
  | 'MEETING'
  | 'PROPOSAL'
  | 'AGREEMENT'
  | 'INVOICE'
  | 'PAYMENT';

export interface Activity {
  id: string;
  tenantId: string;
  userId?: string | null;
  entityType: EntityType;
  entityId: string;
  action: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export type ActivityListResponse = Activity[];
