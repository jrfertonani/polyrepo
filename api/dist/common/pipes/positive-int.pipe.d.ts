import { ArgumentMetadata, ParseIntPipe } from '@nestjs/common';
export declare class PositiveIntPipe extends ParseIntPipe {
    transform(value: string, metadata: ArgumentMetadata): Promise<number>;
}
