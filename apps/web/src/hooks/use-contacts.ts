import { useQuery } from '@tanstack/react-query';
import { listContacts } from '../api/contacts';

export function useContacts() {
  return useQuery(['contacts'], listContacts);
}

export default useContacts;
