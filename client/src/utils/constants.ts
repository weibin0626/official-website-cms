/** Default site ID — can be overridden via environment variable */
export const DEFAULT_SITE_ID: string = import.meta.env.VITE_DEFAULT_SITE_ID || '';

/** Article status constants */
export const ARTICLE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  OFFLINE: 'OFFLINE',
  TRASHED: 'TRASHED',
} as const;

/** Media type constants */
export const MEDIA_TYPES = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT',
  OTHER: 'OTHER',
} as const;

/** Portal primary color */
export const PORTAL_PRIMARY_COLOR = '#1a3a6b';

/** Portal secondary color */
export const PORTAL_SECONDARY_COLOR = '#2563eb';

/** Portal max content width */
export const PORTAL_MAX_WIDTH = 1200;

/** Default pagination size for portal article list */
export const PORTAL_PAGE_SIZE = 20;
