import api from './client';

export const listProposals = async () => {
  const res = await api.get('/proposals');
  return res.data;
};

export default { listProposals };
