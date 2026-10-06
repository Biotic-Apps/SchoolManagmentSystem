import { Global, Module } from '@nestjs/common';
import { FileRefService } from './file-ref.service';
import { FilesController } from './files.controller';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';
import { StorageDriver } from './storage/storage-driver';
import { storageProvider } from './storage/storage.provider';
import { UrlSigner } from './url-signer';

@Global()
@Module({
  controllers: [FilesController],
  providers: [
    FilesRepository,
    FilesService,
    UrlSigner,
    FileRefService,
    storageProvider,
  ],
  exports: [UrlSigner, FileRefService, StorageDriver],
})
export class FilesModule {}
