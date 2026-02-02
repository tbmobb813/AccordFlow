import { useQuery } from '@tanstack/react-query';
import { listInvoices } from '../api/invoices';

export function useInvoices() {
  return useQuery(['invoices'], listInvoices);
}

export default useInvoices;
