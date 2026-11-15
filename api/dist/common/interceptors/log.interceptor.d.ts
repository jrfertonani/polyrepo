import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { type Observable } from 'rxjs';
export declare class LogInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
