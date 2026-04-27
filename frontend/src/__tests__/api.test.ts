import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { register, login, logout, getMe } from '../services/api';

describe('api service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('register() POSTs to /auth/register with credentials:include', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', name: 'Ada', email: 'ada@example.com' }),
    });

    const res = await register('Ada', 'ada@example.com', 'Secret123');
    expect(res.email).toBe('ada@example.com');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/auth/register',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('login() POSTs with credentials:include (cookie set by server)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'fake.jwt.token' }),
    });

    await login('a@b.com', 'Secret123');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/auth/login',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('login() throws the server-provided error message on 4xx', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    await expect(login('a@b.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('logout() POSTs to /auth/logout with credentials:include', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await logout();
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/auth/logout',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('getMe() GETs /user/me with credentials:include (no manual token)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', name: 'Ada', email: 'a@b.com' }),
    });

    await getMe();
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/user/me',
      expect.objectContaining({ credentials: 'include' }),
    );
  });
});
