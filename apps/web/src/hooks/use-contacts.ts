import { useQuery } from '@tanstack/react-query';
import { listContacts } from '../api/contacts';

export function useContacts() {
  return useQuery({ queryKey: ['contacts'], queryFn: listContacts });
}

export default useContacts;
