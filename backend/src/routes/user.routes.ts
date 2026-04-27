import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { getUserById } from '../services/auth.service';

const router = Router();

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = getUserById(req.userId!);
    res.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'User not found';
    res.status(404).json({ error: message });
  }
});

export default router;
