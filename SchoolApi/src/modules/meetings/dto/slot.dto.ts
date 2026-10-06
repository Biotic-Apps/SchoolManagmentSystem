import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  MeetingMode,
  type MeetingSlotStatus,
} from '../../../generated/prisma/client';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';
import { IsTime } from '../../../core/common/validation/is-time';

export class SlotInputDto {
  @IsDateOnly()
  date!: string;

  @IsTime()
  startTime!: string;

  @IsTime()
  endTime!: string;

  @IsIn(Object.values(MeetingMode))
  mode!: MeetingMode;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}

/** One slot (`date`, `startTime`, ...) or several in `slots`. */
export class CreateSlotsDto {
  @ValidateIf((o: CreateSlotsDto) => o.slots === undefined)
  @IsDateOnly()
  date?: string;

  @ValidateIf((o: CreateSlotsDto) => o.slots === undefined)
  @IsTime()
  startTime?: string;

  @ValidateIf((o: CreateSlotsDto) => o.slots === undefined)
  @IsTime()
  endTime?: string;

  @ValidateIf((o: CreateSlotsDto) => o.slots === undefined)
  @IsIn(Object.values(MeetingMode))
  mode?: MeetingMode;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ type: [SlotInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SlotInputDto)
  slots?: SlotInputDto[];
}

export class SlotQueryDto {
  @IsOptional()
  @IsUUID()
  staffUserId?: string;

  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}

export class SlotStaffDto {
  userId!: string;
  name!: string;
}

export class MeetingSlotDto {
  id!: string;
  staff!: SlotStaffDto;
  date!: string;
  startTime!: string;
  endTime!: string;
  mode!: MeetingMode;
  location!: string | null;
  status!: MeetingSlotStatus;
}
