import api from './client';

export const listActivities = async () => {
  const res = await api.get('/activities');
  return res.data;
};

export default { listActivities };
