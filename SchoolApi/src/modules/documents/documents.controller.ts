import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { DocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  DocumentOwnerQueryDto,
  RejectDocumentDto,
  VerifyDocumentDto,
} from './dto/document-input.dto';
import { DocumentDto } from './dto/document.dto';

/** Permission is checked per owner module (students/guardians/staff/admissions). */
@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  @ApiData(DocumentDto, { isArray: true })
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: DocumentOwnerQueryDto,
  ): Promise<DocumentDto[]> {
    return this.documents.list(user, scope, query.ownerType, query.ownerId);
  }

  @Post()
  @ApiData(DocumentDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateDocumentDto,
  ): Promise<DocumentDto> {
    return this.documents.create(user, scope, body);
  }

  @Post(':id/verify')
  @HttpCode(200)
  @ApiData(DocumentDto)
  verify(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: VerifyDocumentDto,
  ): Promise<DocumentDto> {
    return this.documents.verify(user, scope, id, body.note);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @ApiData(DocumentDto)
  reject(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RejectDocumentDto,
  ): Promise<DocumentDto> {
    return this.documents.reject(user, scope, id, body.reason);
  }
}
