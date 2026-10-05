import { IsUUID } from 'class-validator';

export class SetPrincipalDto {
  @IsUUID()
  userId!: string;
}
