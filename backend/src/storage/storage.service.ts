import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local.storage';
import { StorageDriver, StoredFile } from './storage.interface';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: StorageDriver;

  constructor(
    private config: ConfigService,
    private localStorage: LocalStorageService,
  ) {
    const driverName = this.config.get<string>('STORAGE_DRIVER') || 'local';
    if (driverName !== 'local') {
      this.logger.warn(
        `Driver de stockage "${driverName}" non implémenté, fallback sur "local"`,
      );
    }
    this.driver = this.localStorage;
  }

  async save(
    data: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<StoredFile> {
    return this.driver.save(data, filename, mimeType);
  }

  async remove(path: string): Promise<void> {
    return this.driver.remove(path);
  }

  getUrl(path: string): string {
    return this.driver.getUrl(path);
  }
}