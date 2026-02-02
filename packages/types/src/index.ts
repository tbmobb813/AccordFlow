export type UserId = string;

export interface UserProfile {
  id: UserId;
  name: string;
  email?: string;
}
