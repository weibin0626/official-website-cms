import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import config from '../config';
import { createAppError } from '../utils/helpers';

const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'mp4',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const siteId = (_req as any).siteId || 'default';
    const uploadDir = path.join(config.uploadDir, siteId);
    // Use callback style since multer doesn't support async
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomUUID();
    cb(null, `${name}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: .${ext}，允许的类型: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);

/** Multer error handler middleware */
export const handleMulterError = (err: any, _req: any, _res: any, next: any) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    next(createAppError(`文件大小超过限制（最大${MAX_FILE_SIZE / 1024 / 1024}MB）`, 400, 1006));
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    next(createAppError('文件数量超过限制', 400, 1006));
  } else if (err.message?.includes('不支持的文件类型')) {
    next(createAppError(err.message, 400, 1006));
  } else {
    next(err);
  }
};

export default upload;
