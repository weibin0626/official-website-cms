import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import auth, { optionalAuth } from './middleware/auth';
import routes from './routes';

const app = express();

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps, same-origin)
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3003',
      // Site-specific subdomains for local development (Scheme B)
      'http://dzyz.localhost:5173',
      'http://cyjt.localhost:5173',
      'http://mdzx.localhost:5173',
      'http://222.localhost:5173',
      'http://111.localhost:5173',
      'http://ceshi.localhost:5173',
      // Allow all *.localhost:5173 for convenience
      'http://test.localhost:5173',
    ];
    // Also allow any *.localhost:5173 wildcard
    const isLocalhostWildcard = origin && /^http:\/\/[a-z0-9-]+\.localhost:5173$/.test(origin);
    if (!origin || allowedOrigins.includes(origin) || isLocalhostWildcard) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: origin not allowed'), false);
    }
  },
  credentials: true,
}));

// 速率限制（开发环境跳过，避免前端调试时被误封）
const isDev = process.env.NODE_ENV === 'development';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1000,
  message: { code: 4290, data: null, message: '请求过于频繁，请稍后重试' },
  skip: (_req) => isDev, // 开发环境完全跳过速率限制
});
app.use('/api', limiter);

// 请求日志 & 解析
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, data: { status: 'ok', timestamp: new Date().toISOString() }, message: 'success' });
});

// 注册业务路由（域名解析已内置在 auth/optionalAuth 中间件中）
app.use('/api', routes);

// 静态文件服务（上传的文件）
app.use('/uploads', express.static('uploads'));

// 404 & 错误处理（顺序很重要）
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
