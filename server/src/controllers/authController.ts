import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, error: 'Username and password required' });
      return;
    }

    // Query user from Prisma
    const user = await prisma.users.findUnique({ where: { username } });

    if (!user || user.password_hash !== password) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Filter out password before sending to client
    const { password_hash, ...userWithoutPassword } = user;

    // Log login event
    try {
      await prisma.system_logs.create({
        data: {
          level: 'info',
          source: 'authController',
          message: `User ${username} logged in successfully`,
          metadata: { user_id: user.id }
        }
      });
    } catch (e) { /* ignore log errors */ }

    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        badge_number: user.badge_number
      }
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getMe(req: Request, res: Response) {
  res.json({
    success: true,
    user: req.user
  });
}
