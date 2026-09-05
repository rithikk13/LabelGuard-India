import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { AuthService, JWTPayload } from '../auth/authService';
import { authenticate, AuthenticatedRequest } from '../auth/middleware';

export const authRouter = Router();

// Prototype demo credentials. In production these must be provisioned outside source code.
const DEMO_PASSWORD = 'LabelGuard@2026';

function publicUser(user: any) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = db.getUserByUsername(username.trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Seeded prototype users predate password storage. On first successful demo login,
    // hash the documented prototype password and persist only the hash.
    if (!user.passwordHash) {
      if (password !== DEMO_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
      user.passwordHash = await AuthService.hashPassword(password);
      db.save();
    } else if (!(await AuthService.verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = AuthService.generateToken(user);
    return res.json({
      success: true,
      user: publicUser(user),
      token,
      expiresIn: '24h',
      prototypeNotice: 'Prototype credentials only. Replace with managed identity provisioning before production deployment.'
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Authentication service error' });
  }
});

authRouter.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user ? db.getUserById(req.user.userId) : undefined;
  if (!user) {
    return res.status(401).json({ success: false, message: 'User no longer exists' });
  }
  return res.json({ success: true, user: publicUser(user) });
});

export { DEMO_PASSWORD };
