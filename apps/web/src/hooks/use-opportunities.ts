import { useQuery } from '@tanstack/react-query';
import { listOpportunities } from '../api/opportunities';

export function useOpportunities() {
  return useQuery(['opportunities'], listOpportunities);
}

export default useOpportunities;
