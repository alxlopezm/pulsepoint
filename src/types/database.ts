export type Priority = 'High' | 'Medium' | 'Low'

export type InitiativeStatus =
  | 'Requested'
  | 'In Design'
  | 'In Assessment'
  | 'Approved'
  | 'In Development'

export type InitiativeType =
  | 'Technology Request'
  | 'Enterprise Architecture Governance'
  | 'Enterprise Architecture Growth'

export interface BusinessUnit {
  id: string
  name: string
  created_at: string
}

export interface Initiative {
  id: string
  name: string
  description: string | null
  owner: string | null
  business_unit_id: string
  priority: Priority
  status: InitiativeStatus
  type: InitiativeType
  start_date: string | null
  end_date: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export interface Update {
  id: string
  initiative_id: string
  date: string
  description: string
  created_at: string
}

export interface NextStep {
  id: string
  initiative_id: string
  description: string
  responsible: string | null
  due_date: string | null
  start_date: string | null
  completion_date: string | null
  created_at: string
}

export type NextStepDerivedStatus = 'completed' | 'overdue' | 'pending'
