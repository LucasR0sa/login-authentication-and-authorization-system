import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET;
    if (isProduction && !secret) {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return secret || 'dev_only_secret_change_before_production';
  })(),
};
