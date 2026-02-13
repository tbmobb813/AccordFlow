import api from './client';

export const listPayments = async () => {
  const res = await api.get('/payments');
  return res.data;
};

export default { listPayments };
