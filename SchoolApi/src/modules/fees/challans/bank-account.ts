/** Branch setting `fees.bankAccount`: where parents deposit fee challans. */
export interface BankAccount {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  branchCode: string;
}

export const BANK_ACCOUNT_KEY = 'fees.bankAccount';
export const CHALLAN_NOTE_KEY = 'fees.challanNote';

export const EMPTY_BANK_ACCOUNT: BankAccount = {
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  branchCode: '',
};

const LIMITS: Record<keyof BankAccount, number> = {
  bankName: 80,
  accountTitle: 100,
  accountNumber: 34,
  branchCode: 20,
};

/** Error message, or null when `value` is a valid bank account object. */
export function bankAccountError(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return `${BANK_ACCOUNT_KEY} must be an object`;
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!(key in LIMITS)) return `${BANK_ACCOUNT_KEY}.${key} is not known`;
  }
  for (const [key, max] of Object.entries(LIMITS)) {
    const field = record[key];
    if (
      field !== undefined &&
      (typeof field !== 'string' || field.length > max)
    )
      return `${BANK_ACCOUNT_KEY}.${key} must be text of at most ${max} characters`;
  }
  return null;
}

/** Trimmed account, or null when no bank is set (the challan then omits the box). */
export function toBankAccount(value: unknown): BankAccount | null {
  if (bankAccountError(value)) return null;
  const record = value as Partial<BankAccount>;
  const account: BankAccount = {
    bankName: record.bankName?.trim() ?? '',
    accountTitle: record.accountTitle?.trim() ?? '',
    accountNumber: record.accountNumber?.trim() ?? '',
    branchCode: record.branchCode?.trim() ?? '',
  };
  return account.bankName || account.accountNumber ? account : null;
}
