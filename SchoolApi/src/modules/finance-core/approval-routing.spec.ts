import { nextTransition } from '../../core/approvals/approval-transition';
import { limitedApprovalSteps, principalOrAbove } from './approval-routing';

const asLimits = (steps: ReturnType<typeof limitedApprovalSteps>) =>
  steps.map((step, i) => ({
    order: i + 1,
    amountLimitMinor: step.amountLimitMinor ?? null,
  }));

describe('limitedApprovalSteps', () => {
  it('lets the principal approve within the limit and escalates above it', () => {
    const steps = limitedApprovalSteps({ PRINCIPAL: 2_500_000 }, 'ACCOUNTANT');
    expect(steps).toEqual([
      { approverRole: 'PRINCIPAL', amountLimitMinor: 2_500_000n },
      { approverRole: 'SUPER_ADMIN' },
    ]);
    const limits = asLimits(steps);
    expect(nextTransition(limits, 1, 'APPROVED', 1_000_000n)).toEqual({
      status: 'APPROVED',
      currentStep: 1,
    });
    expect(nextTransition(limits, 1, 'APPROVED', 3_000_000n)).toEqual({
      status: 'PENDING',
      currentStep: 2,
    });
    expect(nextTransition(limits, 2, 'APPROVED', 3_000_000n)).toEqual({
      status: 'APPROVED',
      currentStep: 2,
    });
  });

  it('ends at an unlimited principal when no principal limit is set', () => {
    expect(
      limitedApprovalSteps({ ACCOUNTANT: 100_000 }, 'COORDINATOR'),
    ).toEqual([
      { approverRole: 'ACCOUNTANT', amountLimitMinor: 100_000n },
      { approverRole: 'PRINCIPAL' },
    ]);
    expect(limitedApprovalSteps({}, 'ACCOUNTANT')).toEqual([
      { approverRole: 'PRINCIPAL' },
    ]);
  });

  it('skips roles at or below the requester (no self-approval by role)', () => {
    expect(
      limitedApprovalSteps({ ACCOUNTANT: 1, PRINCIPAL: 5 }, 'ACCOUNTANT'),
    ).toEqual([
      { approverRole: 'PRINCIPAL', amountLimitMinor: 5n },
      { approverRole: 'SUPER_ADMIN' },
    ]);
    expect(limitedApprovalSteps({ PRINCIPAL: 5 }, 'PRINCIPAL')).toEqual([
      { approverRole: 'SUPER_ADMIN' },
    ]);
    expect(limitedApprovalSteps({}, 'SUPER_ADMIN')).toEqual([
      { approverRole: 'SUPER_ADMIN' },
    ]);
  });
});

describe('principalOrAbove', () => {
  it('routes a principal’s own request to the super admin', () => {
    expect(principalOrAbove('ACCOUNTANT')).toEqual([
      { approverRole: 'PRINCIPAL' },
    ]);
    expect(principalOrAbove('COORDINATOR')).toEqual([
      { approverRole: 'PRINCIPAL' },
    ]);
    expect(principalOrAbove('PRINCIPAL')).toEqual([
      { approverRole: 'SUPER_ADMIN' },
    ]);
    expect(principalOrAbove('SUPER_ADMIN')).toEqual([
      { approverRole: 'SUPER_ADMIN' },
    ]);
  });
});
