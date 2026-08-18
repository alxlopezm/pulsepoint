export type Priority = 'high' | 'medium' | 'low'

export type InitiativeStatus =
  | 'requested'
  | 'in_design'
  | 'in_assessment'
  | 'approved'
  | 'in_development'

export type InitiativeType = 'technology_request' | 'ea_governance' | 'ea_growth'

export type NextStepStatus = 'pending' | 'started' | 'completed' | 'overdue'

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
  created_by: string
  created_at: string
  updated_at: string
}

export interface Update {
  id: string
  initiative_id: string
  content: string
  created_by: string
  created_at: string
}

export interface NextStep {
  id: string
  initiative_id: string
  description: string
  responsible_person: string | null
  due_date: string | null
  start_date: string | null
  completion_date: string | null
  status: NextStepStatus
  created_at: string
}
