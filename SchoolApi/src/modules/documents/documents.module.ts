import { Module } from '@nestjs/common';
import { DocumentOwnerRegistry } from './document-owner.registry';
import { DocumentMapper } from './document.mapper';
import { DocumentsController } from './documents.controller';
import { DocumentsRepository } from './documents.repository';
import { DocumentsService } from './documents.service';

/** Owner modules register a DocumentOwnerResolver for their owner type. */
@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentOwnerRegistry,
    DocumentsRepository,
    DocumentMapper,
    DocumentsService,
  ],
  exports: [DocumentOwnerRegistry, DocumentsService],
})
export class DocumentsModule {}
