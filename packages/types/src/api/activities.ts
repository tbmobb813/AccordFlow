export interface Activity {
  id: string;
  tenantId: string;
  userId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export type ActivityListResponse = Activity[];
