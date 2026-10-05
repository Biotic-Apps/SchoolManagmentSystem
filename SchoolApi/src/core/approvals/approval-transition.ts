import type {
  ApprovalDecision,
  ApprovalStatus,
} from '../../generated/prisma/client';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';

export interface StepLimit {
  order: number;
  amountLimitMinor: bigint | null;
}

export interface Transition {
  status: ApprovalStatus;
  currentStep: number;
}

/**
 * Next request state after a decision on the current step.
 * - Unlimited step: advance to the next step, or finish when it is the last.
 * - Limited step: finishes when the amount is within its limit, escalates
 *   to the next step when above; above the limit with no next step is refused.
 */
export function nextTransition(
  steps: StepLimit[],
  currentStep: number,
  decision: ApprovalDecision,
  amountMinor: bigint | null,
): Transition {
  if (decision === 'REJECTED') return { status: 'REJECTED', currentStep };
  if (decision === 'RETURNED') return { status: 'RETURNED', currentStep };

  const step = steps.find((s) => s.order === currentStep);
  if (!step) throw new Error(`Step ${currentStep} missing`);
  const next = steps.find((s) => s.order === currentStep + 1);
  const limit = step.amountLimitMinor;

  if (limit !== null && amountMinor !== null && amountMinor > limit) {
    if (!next) {
      throw new AppError(
        ErrorCode.APPROVAL_REQUIRED,
        'Amount exceeds the approval limit and no higher approver is configured',
      );
    }
    return { status: 'PENDING', currentStep: next.order };
  }
  if (limit === null && next)
    return { status: 'PENDING', currentStep: next.order };
  return { status: 'APPROVED', currentStep };
}
