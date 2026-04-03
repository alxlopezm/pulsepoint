export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  created_at?: string;
}

export type InitiativeStatus =
  | 'Requested'
  | 'In Design'
  | 'In Assessment'
  | 'Approved'
  | 'In Development';

export type InitiativePriority = 'High' | 'Medium' | 'Low';

export type InitiativeType =
  | 'Technology Request'
  | 'Enterprise Architecture Governance'
  | 'Enterprise Architecture Growth';

export interface Initiative {
  id: string;
  name: string;
  description?: string;
  owner: string;
  business_unit_id?: string;
  business_unit_name?: string;
  priority: InitiativePriority;
  status: InitiativeStatus;
  type: InitiativeType;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Update {
  id: string;
  initiative_id: string;
  content: string;
  created_at: string;
}

export interface NextStep {
  id: string;
  initiative_id: string;
  title: string;
  responsible?: string;
  due_date?: string;
  start_date?: string;
  completed_date?: string;
  status: 'pending' | 'started' | 'completed';
  created_at: string;
}
