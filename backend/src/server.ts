import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(helmet());
app.disable('x-powered-by');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many registrations from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth/login', loginLimiter);
app.use('/auth/register', registerLimiter);

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyToLog = { ...req.body };
    if (bodyToLog.password) bodyToLog.password = '***';
    console.log('Body:', bodyToLog);
  }
  next();
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

export default app;
