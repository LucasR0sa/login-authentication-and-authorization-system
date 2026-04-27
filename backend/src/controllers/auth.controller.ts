import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 1000,
  path: '/',
};

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body as Record<string, unknown>;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
    const user = await registerUser(String(name), String(email), String(password));
    res.status(201).json(user);
  } catch (err) {
    console.error('[Auth Controller - Register Error]:', err);
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as Record<string, unknown>;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const result = await loginUser(String(email), String(password));
    res.cookie('token', result.token, COOKIE_OPTIONS);
    res.status(200).json(result);
  } catch (err) {
    console.error('[Auth Controller - Login Error]:', err);
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie('token', { path: '/' });
  res.status(200).json({ message: 'Logged out successfully' });
}
