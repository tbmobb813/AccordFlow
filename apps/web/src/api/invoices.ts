import api from './client';

export const listInvoices = async () => {
  const res = await api.get('/invoices');
  return res.data;
};

export default { listInvoices };
