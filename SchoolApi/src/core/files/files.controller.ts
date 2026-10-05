import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiData } from '../common/swagger/api-data.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { CurrentScope } from '../rbac/scope/current-scope.decorator';
import type { Scope } from '../rbac/scope/scope';
import { FileContentQueryDto } from './dto/file-content-query.dto';
import { FileUploadedDto } from './dto/file-uploaded.dto';
import { SignedUrlDto } from './dto/signed-url.dto';
import { UPLOAD_FILE_SCHEMA, UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';
import { MAX_UPLOAD_BYTES, type UploadCandidate } from './upload-policy';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: UPLOAD_FILE_SCHEMA })
  @ApiData(FileUploadedDto)
  upload(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @UploadedFile() file: UploadCandidate | undefined,
    @Body() body: UploadFileDto,
  ): Promise<FileUploadedDto> {
    return this.files.upload(user, scope, file, body.purpose);
  }

  @Get(':id/url')
  @ApiData(SignedUrlDto)
  url(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SignedUrlDto> {
    return this.files.signedUrl(user, scope, id);
  }

  /** Target of signed URLs; the signature is the authorization. */
  @Public()
  @SkipThrottle()
  @Get(':id/content')
  async content(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FileContentQueryDto,
  ): Promise<StreamableFile> {
    const { file, stream } = await this.files.open(id, query.exp, query.sig);
    const inline = file.mime.startsWith('image/');
    const name = encodeURIComponent(file.originalName);
    return new StreamableFile(stream, {
      type: file.mime,
      length: file.size,
      disposition: `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${name}`,
    });
  }
}
