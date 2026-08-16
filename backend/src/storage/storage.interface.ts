export interface StoredFile {
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageDriver {
  save(
    data: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<StoredFile>;
  remove(path: string): Promise<void>;
  getUrl(path: string): string;
}