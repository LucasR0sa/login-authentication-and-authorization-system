import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

function sanitizeName(raw: string): string {
  return raw
    .trim()
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .substring(0, 100)
    .trim();
}

const users: User[] = [];
let nextId = 1;

export async function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  if (!PASSWORD_POLICY.test(password)) {
    throw new Error('Password must contain uppercase, lowercase and a number');
  }

  if (users.find(u => u.email === normalizedEmail)) {
    throw new Error('Email already registered');
  }

  const safeName = sanitizeName(name);
  if (!safeName) throw new Error('Name is required');

  const passwordHash = await argon2.hash(password);
  const user: User = { id: String(nextId++), name: safeName, email: normalizedEmail, passwordHash };
  users.push(user);
  return { id: user.id, name: user.name, email: user.email };
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email === normalizedEmail);
  if (!user) throw new Error('Invalid credentials');

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: '1h' },
  );
  return { token };
}

export function getUserById(id: string) {
  const user = users.find(u => u.id === id);
  if (!user) throw new Error('User not found');
  return { id: user.id, name: user.name, email: user.email };
}
