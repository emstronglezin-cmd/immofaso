import { Global, Module } from '@nestjs/common';
import { LocalStorageService } from './local.storage';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [LocalStorageService, StorageService],
  exports: [StorageService],
})
export class StorageModule {}