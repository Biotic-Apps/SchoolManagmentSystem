import { Global, Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';
import { storageProvider } from './storage/storage.provider';
import { UrlSigner } from './url-signer';

@Global()
@Module({
  controllers: [FilesController],
  providers: [FilesRepository, FilesService, UrlSigner, storageProvider],
  exports: [UrlSigner],
})
export class FilesModule {}
