"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInterceptor = void 0;
const rxjs_1 = require("rxjs");
class LogInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        const now = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            const response = context.switchToHttp().getResponse();
            const statusCode = response.statusCode;
            const contentLength = response.get('content-length') || '0';
            console.log(`${method} ${url} ${statusCode} ${contentLength} - ${Date.now() - now}ms`);
        }));
    }
}
exports.LogInterceptor = LogInterceptor;
//# sourceMappingURL=log.interceptor.js.map