import api from './client';

export const listCompanies = async () => {
  const res = await api.get('/companies');
  return res.data;
};

export default { listCompanies };
