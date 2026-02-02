import { useQuery } from '@tanstack/react-query';
import { listAgreements } from '../api/agreements';

export function useAgreements() {
  return useQuery({ queryKey: ['agreements'], queryFn: listAgreements });
}

export default useAgreements;
