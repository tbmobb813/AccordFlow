import { useQuery } from '@tanstack/react-query';
import { listOpportunities } from '../api/opportunities';

export function useOpportunities() {
  return useQuery({ queryKey: ['opportunities'], queryFn: listOpportunities });
}

export default useOpportunities;
