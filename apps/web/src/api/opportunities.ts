import api from './client';

export const listOpportunities = async () => {
  const res = await api.get('/opportunities');
  return res.data;
};

export default { listOpportunities };
