import { useQuery } from '@tanstack/react-query';
import { listProposals } from '../api/proposals';

export function useProposals() {
  return useQuery(['proposals'], listProposals);
}

export default useProposals;
