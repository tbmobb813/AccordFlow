import { useQuery } from '@tanstack/react-query';
import { listActivities } from '../api/activities';

export function useActivities() {
  return useQuery(['activities'], listActivities);
}

export default useActivities;
