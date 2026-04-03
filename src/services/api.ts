import type {
  User,
  BusinessUnit,
  Initiative,
  InitiativeStatus,
  InitiativePriority,
  InitiativeType,
  Update,
  NextStep,
} from '../types';

const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('pulsepoint_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('pulsepoint_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => request<{ user: User }>('/auth/me'),
};

// Business Units
export const businessUnits = {
  list: () => request<{ businessUnits: BusinessUnit[] }>('/business-units'),
};

// Initiatives
export interface InitiativeFilters {
  status?: InitiativeStatus | '';
  business_unit_id?: string;
  search?: string;
}

export interface InitiativeData {
  name: string;
  description?: string;
  owner: string;
  business_unit_id?: string;
  priority: InitiativePriority;
  status?: InitiativeStatus;
  type: InitiativeType;
}

export const initiatives = {
  list: (filters?: InitiativeFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.business_unit_id) params.set('business_unit_id', filters.business_unit_id);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    return request<{ initiatives: Initiative[] }>(`/initiatives${query ? `?${query}` : ''}`);
  },

  get: (id: string) =>
    request<{ initiative: Initiative }>(`/initiatives/${id}`),

  create: (data: InitiativeData) =>
    request<{ initiative: Initiative }>('/initiatives', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<InitiativeData>) =>
    request<{ initiative: Initiative }>(`/initiatives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/initiatives/${id}`, {
      method: 'DELETE',
    }),
};

// Updates
export const updates = {
  list: (initiativeId: string) =>
    request<{ updates: Update[] }>(`/initiatives/${initiativeId}/updates`),

  create: (initiativeId: string, content: string) =>
    request<{ update: Update }>(`/initiatives/${initiativeId}/updates`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  delete: (initiativeId: string, id: string) =>
    request<{ message: string }>(`/initiatives/${initiativeId}/updates/${id}`, {
      method: 'DELETE',
    }),
};

// Next Steps
export interface NextStepData {
  title: string;
  responsible?: string;
  due_date?: string;
  start_date?: string;
  completed_date?: string;
  status?: 'pending' | 'started' | 'completed';
}

export const nextSteps = {
  list: (initiativeId: string) =>
    request<{ nextSteps: NextStep[] }>(`/initiatives/${initiativeId}/next-steps`),

  create: (initiativeId: string, data: NextStepData) =>
    request<{ nextStep: NextStep }>(`/initiatives/${initiativeId}/next-steps`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (initiativeId: string, id: string, data: Partial<NextStepData>) =>
    request<{ nextStep: NextStep }>(`/initiatives/${initiativeId}/next-steps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (initiativeId: string, id: string) =>
    request<{ message: string }>(`/initiatives/${initiativeId}/next-steps/${id}`, {
      method: 'DELETE',
    }),
};
