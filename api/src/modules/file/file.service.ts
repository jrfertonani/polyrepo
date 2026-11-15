import { Multer } from 'multer';
import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FileService {
  async upload(file: Express.Multer.File, path: string) {
    return writeFile(path, file.buffer); // caso queira usar uma ex:aws S3, você pode substituir essa linha pelo código de upload para o S3
  }
}
