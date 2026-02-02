import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and tenant
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clerk-token');
  const tenantSlug = localStorage.getItem('tenant-slug') || 'demo-company';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['x-tenant-slug'] = tenantSlug;

  return config;
});

// API client functions
export const contactsApi = {
  getAll: () => api.get('/contacts'),
  getOne: (id: string) => api.get(`/contacts/${id}`),
  create: (data: any) => api.post('/contacts', data),
  update: (id: string, data: any) => api.patch(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};

export const opportunitiesApi = {
  getAll: () => api.get('/opportunities'),
  getOne: (id: string) => api.get(`/opportunities/${id}`),
  create: (data: any) => api.post('/opportunities', data),
  update: (id: string, data: any) => api.patch(`/opportunities/${id}`, data),
  delete: (id: string) => api.delete(`/opportunities/${id}`),
};

export const proposalsApi = {
  getAll: () => api.get('/proposals'),
  getOne: (id: string) => api.get(`/proposals/${id}`),
  create: (data: any) => api.post('/proposals', data),
  update: (id: string, data: any) => api.patch(`/proposals/${id}`, data),
  delete: (id: string) => api.delete(`/proposals/${id}`),
};

export const agreementsApi = {
  getAll: () => api.get('/agreements'),
  getOne: (id: string) => api.get(`/agreements/${id}`),
  create: (data: any) => api.post('/agreements', data),
  update: (id: string, data: any) => api.patch(`/agreements/${id}`, data),
  delete: (id: string) => api.delete(`/agreements/${id}`),
};

export const invoicesApi = {
  getAll: () => api.get('/invoices'),
  getOne: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.patch(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};

export const paymentsApi = {
  getAll: () => api.get('/payments'),
  getOne: (id: string) => api.get(`/payments/${id}`),
  create: (data: any) => api.post('/payments', data),
  update: (id: string, data: any) => api.patch(`/payments/${id}`, data),
  delete: (id: string) => api.delete(`/payments/${id}`),
};

export const activitiesApi = {
  getAll: (entityType?: string, entityId?: string) => {
    const params = new URLSearchParams();
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', entityId);
    return api.get(`/activities?${params.toString()}`);
  },
  getOne: (id: string) => api.get(`/activities/${id}`),
};
