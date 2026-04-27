import { registerUser, loginUser, getUserById } from '../services/auth.service';

jest.setTimeout(30000);

describe('auth.service', () => {
  describe('registerUser', () => {
    it('creates a user and returns public fields (no passwordHash)', async () => {
      const user = await registerUser('Alice', 'alice@example.com', 'Secret123');
      expect(user).toEqual({ id: expect.any(String), name: 'Alice', email: 'alice@example.com' });
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('throws when email is already registered', async () => {
      await registerUser('Bob', 'bob@example.com', 'Secret123');
      await expect(registerUser('Bob2', 'bob@example.com', 'Secret123')).rejects.toThrow('Email already registered');
    });

    it('normalizes email to lowercase', async () => {
      const user = await registerUser('Cam', 'CAM@EXAMPLE.COM', 'Secret123');
      expect(user.email).toBe('cam@example.com');
    });

    it('strips HTML tags from name', async () => {
      const user = await registerUser('<script>alert(1)</script>Dan', 'dan@example.com', 'Secret123');
      expect(user.name).toBe('Dan');
      expect(user.name).not.toContain('<script>');
    });

    it('throws for invalid email format', async () => {
      await expect(registerUser('Eve', 'notanemail', 'Secret123')).rejects.toThrow('Invalid email format');
    });

    it('throws for password shorter than 8 characters', async () => {
      await expect(registerUser('Fay', 'fay@example.com', 'Ab1')).rejects.toThrow('at least 8 characters');
    });

    it('throws for password without uppercase', async () => {
      await expect(registerUser('Gil', 'gil@example.com', 'secret123')).rejects.toThrow('uppercase');
    });

    it('throws for password without a number', async () => {
      await expect(registerUser('Hal', 'hal@example.com', 'SecretABC')).rejects.toThrow('number');
    });
  });

  describe('loginUser', () => {
    it('returns a signed JWT for valid credentials', async () => {
      await registerUser('Ida', 'ida@example.com', 'Secret123');
      const result = await loginUser('ida@example.com', 'Secret123');
      expect(result.token).toEqual(expect.any(String));
      expect(result.token.split('.')).toHaveLength(3);
    });

    it('accepts email case-insensitively', async () => {
      await registerUser('Jay', 'jay@example.com', 'Secret123');
      const result = await loginUser('JAY@EXAMPLE.COM', 'Secret123');
      expect(result.token).toEqual(expect.any(String));
    });

    it('throws for unknown email', async () => {
      await expect(loginUser('nobody@example.com', 'Secret123')).rejects.toThrow('Invalid credentials');
    });

    it('throws for wrong password', async () => {
      await registerUser('Kay', 'kay@example.com', 'Secret123');
      await expect(loginUser('kay@example.com', 'WrongPass9')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUserById', () => {
    it('returns the user when id exists', async () => {
      const created = await registerUser('Lee', 'lee@example.com', 'Secret123');
      const found = getUserById(created.id);
      expect(found.email).toBe('lee@example.com');
    });

    it('throws when id does not exist', () => {
      expect(() => getUserById('does-not-exist')).toThrow('User not found');
    });
  });
});
