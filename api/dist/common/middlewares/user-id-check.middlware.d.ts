import type { NestMiddleware } from '@nestjs/common';
export declare class UserIdCheckMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void): any;
}
