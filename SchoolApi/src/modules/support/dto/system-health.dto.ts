import { ApiProperty } from '@nestjs/swagger';

export class QueueHealthDto {
  @ApiProperty({ enum: ['bullmq', 'inline'] }) driver!: 'bullmq' | 'inline';
  @ApiProperty() waiting!: number;
  @ApiProperty() failed!: number;
}

export class StorageHealthDto {
  @ApiProperty({ enum: ['local', 's3'] }) driver!: string;
  @ApiProperty() ok!: boolean;
}

export class LastBackupDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  finishedAt!: string | null;
  @ApiProperty({ enum: ['RUNNING', 'DONE', 'FAILED'] }) status!: string;
}

export class SystemHealthDto {
  @ApiProperty({ enum: ['ok', 'error'] }) db!: 'ok' | 'error';
  @ApiProperty({ type: QueueHealthDto }) queue!: QueueHealthDto;
  @ApiProperty({ type: StorageHealthDto }) storage!: StorageHealthDto;
  @ApiProperty({ type: LastBackupDto, nullable: true })
  lastBackup!: LastBackupDto | null;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  lastRestoreVerified!: string | null;
  @ApiProperty() version!: string;
}
