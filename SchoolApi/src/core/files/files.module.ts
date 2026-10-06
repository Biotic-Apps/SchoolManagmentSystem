import { Global, Module } from '@nestjs/common';
import { AntivirusScanner } from './antivirus/antivirus-scanner';
import { scannerProvider } from './antivirus/scanner.provider';
import { FileRefService } from './file-ref.service';
import { FilesController } from './files.controller';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';
import { ImageProcessor } from './image/image-processor';
import { StorageDriver } from './storage/storage-driver';
import { storageProvider } from './storage/storage.provider';
import { UploadPipeline } from './upload-pipeline';
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
    scannerProvider,
    ImageProcessor,
    UploadPipeline,
  ],
  exports: [
    UrlSigner,
    FileRefService,
    StorageDriver,
    AntivirusScanner,
    ImageProcessor,
    UploadPipeline,
  ],
})
export class FilesModule {}
