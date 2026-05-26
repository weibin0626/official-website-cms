export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SITE_ADMIN = 'SITE_ADMIN',
  EDITOR = 'EDITOR',
  REVIEWER = 'REVIEWER',
  VIEWER = 'VIEWER',
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  RECYCLED = 'RECYCLED',
}

export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}
