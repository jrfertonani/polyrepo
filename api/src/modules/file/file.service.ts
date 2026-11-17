import { Injectable, Logger } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import 'multer';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly storageRoot = resolve(process.cwd(), 'storage');

  async upload(file: Express.Multer.File, filePath: string): Promise<void> {
    const directory = dirname(filePath);
    await mkdir(directory, { recursive: true });
    await writeFile(filePath, file.buffer);
  }

  async removeByPublicUrl(publicUrl?: string | null): Promise<void> {
    if (!publicUrl) {
      return;
    }

    const relativePath = publicUrl.replace(/^\/?storage\/?/, '');
    const targetPath = resolve(this.storageRoot, relativePath);

    // Proteção contra Path Traversal (compatível com Linux/WSL2 e Windows via path.sep)
    if (
      !targetPath.startsWith(`${this.storageRoot}${sep}`) &&
      targetPath !== this.storageRoot
    ) {
      this.logger.warn(
        `Tentativa bloqueada de remoção fora de storage: ${publicUrl}`,
      );
      return;
    }

    try {
      await unlink(targetPath);
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        this.logger.warn(
          `Falha ao remover arquivo antigo (${targetPath}): ${error?.message}`,
        );
      }
    }
  }
}
