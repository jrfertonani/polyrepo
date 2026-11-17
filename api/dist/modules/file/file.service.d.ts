import 'multer';
export declare class FileService {
    private readonly logger;
    private readonly storageRoot;
    upload(file: Express.Multer.File, filePath: string): Promise<void>;
    removeByPublicUrl(publicUrl?: string | null): Promise<void>;
}
