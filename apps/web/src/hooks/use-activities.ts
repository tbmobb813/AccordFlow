import { useQuery } from '@tanstack/react-query';
import { listActivities } from '../api/activities';

export function useActivities() {
  return useQuery({ queryKey: ['activities'], queryFn: listActivities });
}

export default useActivities;
