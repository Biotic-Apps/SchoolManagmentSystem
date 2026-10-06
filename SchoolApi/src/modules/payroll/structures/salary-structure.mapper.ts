import type { SalaryStructure } from '../../../generated/prisma/client';
import { sumMinor } from '../../finance-core/money';
import { parseComponents } from './current-structure';
import type { SalaryStructureDto } from './dto/salary-structure.dto';

export function toSalaryStructureDto(
  row: SalaryStructure,
  names: ReadonlyMap<string, string>,
): SalaryStructureDto {
  const allowances = parseComponents(row.allowances);
  const deductions = parseComponents(row.deductions);
  const allowancesMinor = sumMinor(
    allowances.map((a) => BigInt(a.amountMinor)),
  );
  const deductionsMinor = sumMinor(
    deductions.map((d) => BigInt(d.amountMinor)),
  );
  const name = names.get(row.createdById);
  return {
    id: row.id,
    staffId: row.staffId,
    effectiveFrom: row.effectiveFrom,
    basicMinor: Number(row.basicMinor),
    allowances,
    deductions,
    allowancesMinor: Number(allowancesMinor),
    deductionsMinor: Number(deductionsMinor),
    grossMinor: Number(row.basicMinor + allowancesMinor),
    reason: row.reason,
    createdBy: name ? { id: row.createdById, name } : null,
    createdAt: row.createdAt.toISOString(),
  };
}
