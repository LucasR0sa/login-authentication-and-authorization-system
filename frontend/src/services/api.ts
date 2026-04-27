const BASE_URL = 'http://localhost:3000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse<{ id: string; name: string; email: string }>(res);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ token: string }>(res);
}

export async function logout() {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/user/me`, {
    credentials: 'include',
  });
  return handleResponse<{ id: string; name: string; email: string }>(res);
}
