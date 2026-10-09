import { validateSetting } from '../../branches/settings/branch-settings.defaults';
import { bankAccountError, toBankAccount } from './bank-account';

describe('bank account setting', () => {
  const account = {
    bankName: ' HBL ',
    accountTitle: 'Demo School',
    accountNumber: 'PK36HABB0000001123456702',
    branchCode: '0456',
  };

  it('validates through the branch settings', () => {
    expect(validateSetting('fees.bankAccount', account)).toBeNull();
    expect(validateSetting('fees.bankAccount', 'HBL')).toMatch(/object/);
    expect(bankAccountError({ ...account, iban: 'x' })).toMatch(/not known/);
    expect(
      bankAccountError({ ...account, branchCode: 'x'.repeat(21) }),
    ).toMatch(/at most 20/);
    expect(
      validateSetting('fees.challanNote', 'Pay before the 10th'),
    ).toBeNull();
  });

  it('trims values and treats an empty account as none', () => {
    expect(toBankAccount(account)?.bankName).toBe('HBL');
    expect(
      toBankAccount({ bankName: '', accountTitle: 'x', accountNumber: '' }),
    ).toBeNull();
    expect(toBankAccount(null)).toBeNull();
  });
});
