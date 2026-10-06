import { checkRegisterAction } from './register-state';

describe('checkRegisterAction', () => {
  const submitted = { status: 'SUBMITTED' as const, submittedById: 'teacher' };

  it('allows drafting and submitting an unmarked or draft register', () => {
    expect(checkRegisterAction(null, 'SAVE_DRAFT', 'u')).toBe('OK');
    expect(checkRegisterAction(null, 'SUBMIT', 'u')).toBe('OK');
    const draft = { status: 'DRAFT' as const, submittedById: null };
    expect(checkRegisterAction(draft, 'SAVE_DRAFT', 'u')).toBe('OK');
    expect(checkRegisterAction(draft, 'SUBMIT', 'u')).toBe('OK');
  });

  it('lets only the submitter re-submit before the lock', () => {
    expect(checkRegisterAction(submitted, 'SUBMIT', 'teacher')).toBe('OK');
    expect(checkRegisterAction(submitted, 'SUBMIT', 'other')).toBe(
      'ALREADY_SUBMITTED',
    );
  });

  it('never turns a submitted register back into a draft', () => {
    expect(checkRegisterAction(submitted, 'SAVE_DRAFT', 'teacher')).toBe(
      'ALREADY_SUBMITTED',
    );
  });

  it('refuses changes to locked or in-review registers', () => {
    const locked = { status: 'LOCKED' as const, submittedById: 'teacher' };
    expect(checkRegisterAction(locked, 'SUBMIT', 'teacher')).toBe('LOCKED');
    expect(checkRegisterAction(locked, 'SAVE_DRAFT', 'teacher')).toBe('LOCKED');
    const review = { status: 'PENDING_REVIEW' as const, submittedById: null };
    expect(checkRegisterAction(review, 'SUBMIT', 'teacher')).toBe(
      'PENDING_REVIEW',
    );
  });
});
