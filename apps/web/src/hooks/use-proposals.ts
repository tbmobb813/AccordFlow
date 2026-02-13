import { useQuery } from '@tanstack/react-query';
import { listProposals } from '../api/proposals';

export function useProposals() {
  return useQuery({ queryKey: ['proposals'], queryFn: listProposals });
}

export default useProposals;
