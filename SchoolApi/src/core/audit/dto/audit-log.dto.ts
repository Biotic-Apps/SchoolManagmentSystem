import { IdNameDto } from '../../common/dto/id-name.dto';

export class AuditLogDto {
  id!: string;
  action!: string;
  entityType!: string;
  entityId!: string;
  actor!: IdNameDto | null;
  onBehalfOf!: string | null;
  before!: unknown;
  after!: unknown;
  at!: string;
}
