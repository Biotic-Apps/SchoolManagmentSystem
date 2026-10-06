import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/common/decorators/public.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import { BrandingService } from './branding.service';
import { BrandingDto, BrandingQueryDto } from './dto/branding.dto';

/** Login page branding; public and rate limited by the default throttler. */
@ApiTags('settings')
@Controller('branding')
export class BrandingController {
  constructor(private readonly branding: BrandingService) {}

  @Public()
  @Get()
  @ApiData(BrandingDto)
  get(@Query() query: BrandingQueryDto): Promise<BrandingDto> {
    return this.branding.get(query.schoolId);
  }
}
