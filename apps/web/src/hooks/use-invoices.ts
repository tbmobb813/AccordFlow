import { useQuery } from '@tanstack/react-query';
import { listInvoices } from '../api/invoices';

export function useInvoices() {
  return useQuery({ queryKey: ['invoices'], queryFn: listInvoices });
}

export default useInvoices;
