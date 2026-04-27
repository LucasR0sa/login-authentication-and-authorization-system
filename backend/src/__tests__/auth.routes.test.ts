import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import authRoutes from '../routes/auth.routes';
import userRoutes from '../routes/user.routes';

jest.setTimeout(30000);

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/auth', authRoutes);
  app.use('/user', userRoutes);
  return app;
}

describe('auth routes', () => {
  const app = buildApp();

  it('POST /auth/register returns 201 with public user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Ada', email: 'ada@example.com', password: 'Secret123' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: expect.any(String), name: 'Ada', email: 'ada@example.com' });
  });

  it('POST /auth/register returns 400 when fields are missing', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'x@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /auth/register returns 400 for weak password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Weak', email: 'weak@example.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 characters/);
  });

  it('POST /auth/register returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Bad', email: 'notanemail', password: 'Secret123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('POST /auth/login returns 200 with token and sets httpOnly cookie', async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'Ben', email: 'ben@example.com', password: 'Secret123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'ben@example.com', password: 'Secret123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.headers['set-cookie']).toBeDefined();
    const cookie = (res.headers['set-cookie'] as unknown as string[])[0];
    expect(cookie).toMatch(/token=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it('POST /auth/login returns 401 for wrong password', async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'Cia', email: 'cia@example.com', password: 'Secret123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'cia@example.com', password: 'WrongPass9' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('GET /user/me returns 401 without token', async () => {
    const res = await request(app).get('/user/me');
    expect(res.status).toBe(401);
  });

  it('GET /user/me returns user when token is in Authorization header', async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'Dia', email: 'dia@example.com', password: 'Secret123' });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'dia@example.com', password: 'Secret123' });

    const res = await request(app)
      .get('/user/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('dia@example.com');
  });

  it('GET /user/me returns user when token is in httpOnly cookie', async () => {
    const agent = request.agent(app);

    await agent
      .post('/auth/register')
      .send({ name: 'Eva', email: 'eva@example.com', password: 'Secret123' });

    await agent
      .post('/auth/login')
      .send({ email: 'eva@example.com', password: 'Secret123' });

    const res = await agent.get('/user/me');
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('eva@example.com');
  });

  it('POST /auth/logout clears the cookie', async () => {
    const res = await request(app).post('/auth/logout');
    expect(res.status).toBe(200);
    const cookie = (res.headers['set-cookie'] as unknown as string[] | undefined)?.[0] ?? '';
    expect(cookie).toMatch(/token=;/);
  });
});
