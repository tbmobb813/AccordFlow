import api from './client';

export const listContacts = async () => {
  const res = await api.get('/contacts');
  return res.data;
};

export default { listContacts };
