"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserIdCheckMiddleware = void 0;
class UserIdCheckMiddleware {
    use(req, res, next) {
        console.log('UserIdCheckMiddleware', 'antes');
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const id = parseInt(userId, 10);
        if (isNaN(Number(id)) || Number(id) <= 0) {
            return res
                .status(400)
                .json({ message: 'User ID must be a number and positive' });
        }
        req.userId = id;
        console.log('UserIdCheckMiddleware', 'depois');
        next();
    }
}
exports.UserIdCheckMiddleware = UserIdCheckMiddleware;
//# sourceMappingURL=user-id-check.middlware.js.map