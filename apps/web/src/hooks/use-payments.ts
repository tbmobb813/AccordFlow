import { useQuery } from '@tanstack/react-query';
import { listPayments } from '../api/payments';

export function usePayments() {
  return useQuery(['payments'], listPayments);
}

export default usePayments;
