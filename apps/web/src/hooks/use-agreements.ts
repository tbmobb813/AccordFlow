import { useQuery } from '@tanstack/react-query';
import { listAgreements } from '../api/agreements';

export function useAgreements() {
  return useQuery(['agreements'], listAgreements);
}

export default useAgreements;
