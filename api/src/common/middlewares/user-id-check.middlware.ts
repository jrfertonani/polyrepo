import type { NestMiddleware } from '@nestjs/common';

export class UserIdCheckMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log('UserIdCheckMiddleware', 'antes');
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate that the userId is a number
    const id = parseInt(userId, 10);
    if (isNaN(Number(id)) || Number(id) <= 0) {
      return res
        .status(400)
        .json({ message: 'User ID must be a number and positive' });
    }

    // Attach the validated userId to the request object for further use
    req.userId = id;

    console.log('UserIdCheckMiddleware', 'depois');

    next();
  }
}
