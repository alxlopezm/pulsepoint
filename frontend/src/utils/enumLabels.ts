import type { InitiativeStatus, InitiativeType, Priority } from '../types/database'

export const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const initiativeStatusLabels: Record<InitiativeStatus, string> = {
  requested: 'Requested',
  in_design: 'In Design',
  in_assessment: 'In Assessment',
  approved: 'Approved',
  in_development: 'In Development',
}

export const initiativeTypeLabels: Record<InitiativeType, string> = {
  technology_request: 'Technology Request',
  ea_governance: 'Enterprise Architecture Governance',
  ea_growth: 'Enterprise Architecture Growth',
}
