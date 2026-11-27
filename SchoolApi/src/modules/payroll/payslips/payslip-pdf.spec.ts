import { designationLabel, payslipMonth } from './payslip-pdf';

describe('payslip labels', () => {
  it('prints the month in words', () => {
    expect(payslipMonth('2026-11')).toBe('November 2026');
    expect(payslipMonth('2027-01')).toBe('January 2027');
  });

  it('prints role codes as words and keeps typed designations', () => {
    expect(designationLabel('TEACHER')).toBe('Teacher');
    expect(designationLabel('HEAD_TEACHER')).toBe('Head Teacher');
    expect(designationLabel('Senior Accountant')).toBe('Senior Accountant');
  });
});
