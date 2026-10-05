import type { Term } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import type { TermDto } from '../dto/term.dto';

export function toTermDto(term: Term): TermDto {
  return {
    id: term.id,
    sessionId: term.sessionId,
    name: term.name,
    startDate: formatDate(term.startDate),
    endDate: formatDate(term.endDate),
  };
}
