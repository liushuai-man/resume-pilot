import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import type { Application } from 'express';
import {
  authRouter,
  resumeRouter,
  aiRouter,
  interviewRouter,
  modelConfigRouter,
  uploadRouter,
} from './routes/index';

export const app: Application = express();
app.set('trust proxy', 1);

// Middleware
app.use(cookieParser());

// CORS 配置 - 开发环境允许多个端口
const allowedOrigins = env.CORS_ORIGIN;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: 'AI 请求过于频繁，请稍后再试', data: null },
});

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/ai', aiRateLimit, aiRouter);
app.use('/api/interview', aiRateLimit, interviewRouter);
app.use('/api/model-config', aiRateLimit, modelConfigRouter);
app.use('/api/upload', uploadRouter);
