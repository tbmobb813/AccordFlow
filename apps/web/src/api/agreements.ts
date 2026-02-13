import api from './client';

export const listAgreements = async () => {
  const res = await api.get('/agreements');
  return res.data;
};

export default { listAgreements };
