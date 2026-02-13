import { useQuery } from '@tanstack/react-query';
import { listPayments } from '../api/payments';

export function usePayments() {
  return useQuery({ queryKey: ['payments'], queryFn: listPayments });
}

export default usePayments;
