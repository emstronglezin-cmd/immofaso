import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageDriver, StoredFile } from './storage.interface';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class LocalStorageService implements StorageDriver {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    this.uploadsDir = this.config.get<string>('UPLOADS_DIR') || 'uploads';
    this.baseUrl = (
      this.config.get<string>('PUBLIC_URL') || 'http://localhost:3000'
    ).replace(/\/$/, '');
    this.ensureDir(this.uploadsDir);
  }

  async save(
    data: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<StoredFile> {
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedName = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;
    const fullPath = path.join(this.uploadsDir, storedName);

    try {
      this.ensureDir(path.dirname(fullPath));
      await fs.promises.writeFile(fullPath, data);
    } catch (err) {
      this.logger.error('Échec de l\'écriture du fichier', err);
      throw new Error('Impossible de stocker le fichier');
    }

    return {
      path: storedName,
      url: this.getUrl(storedName),
      size: data.length,
      mimeType,
    };
  }

  async remove(storedPath: string): Promise<void> {
    if (!storedPath) {
      return;
    }
    const fullPath = path.join(this.uploadsDir, storedPath);
    try {
      await fs.promises.unlink(fullPath);
    } catch {
      this.logger.warn(`Fichier introuvable ou déjà supprimé : ${storedPath}`);
    }
  }

  getUrl(storedPath: string): string {
    return `${this.baseUrl}/api/v1/documents/file/${encodeURIComponent(storedPath)}`;
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}