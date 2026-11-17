import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    ParseIntPipe,
} from '@nestjs/common';

@Injectable()
export class PositiveIntPipe extends ParseIntPipe {
    async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
        const id = await super.transform(value, metadata);

        if (id <= 0) {
            throw new BadRequestException('O ID do usuário deve ser um número inteiro positivo.');
        }

        return id;
    }
}