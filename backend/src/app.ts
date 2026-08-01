import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/ai', aiRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/model-config', modelConfigRouter);
app.use('/api/upload', uploadRouter);
