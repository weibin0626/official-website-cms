import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { code: 4290, data: null, message: '请求过于频繁，请稍后重试' },
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

// 注册业务路由
app.use('/api', routes);

// 静态文件服务（上传的文件）
app.use('/uploads', express.static('uploads'));

// 404 & 错误处理（顺序很重要）
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
