import { NextStepStatus, type Prisma } from '@prisma/client'

export function startOfTodayUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export function computeNextStepStatus(input: {
  completion_date?: Date | null
  due_date?: Date | null
  status?: NextStepStatus
}): NextStepStatus {
  if (input.completion_date) return NextStepStatus.completed
  if (input.due_date && input.due_date.getTime() < startOfTodayUTC().getTime()) {
    return NextStepStatus.overdue
  }
  return input.status ?? NextStepStatus.pending
}

// Lazily flips any next steps that have gone past their due date since they
// were last written, so status stays correct even without a new write.
export async function syncOverdueNextSteps(
  tx: Prisma.TransactionClient,
  initiativeId?: string,
): Promise<void> {
  await tx.nextStep.updateMany({
    where: {
      status: { in: [NextStepStatus.pending, NextStepStatus.started] },
      due_date: { lt: startOfTodayUTC() },
      ...(initiativeId ? { initiative_id: initiativeId } : {}),
    },
    data: { status: NextStepStatus.overdue },
  })
}
