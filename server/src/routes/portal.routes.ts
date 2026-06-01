import { Router } from 'express';
import * as portalController from '../controllers/portal.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// 加载 optionalAuth：通过 Host 头解析域名 → currentSiteId（方案 B）
router.use(optionalAuth);

// Public portal routes — no login required
router.get('/home', portalController.getHome);
router.get('/articles', portalController.getArticleList);
router.get('/articles/:id', portalController.getArticleDetail);
router.get('/nodes/:id', portalController.getNodeDetail);
router.get('/leaders', portalController.getLeaders);
router.get('/teachers', portalController.getTeachers);
router.get('/banners', portalController.getBanners);
router.get('/quicklinks', portalController.getQuickLinks);
router.get('/friendlinks', portalController.getFriendLinks);
router.get('/nav', portalController.getNavTree);

export default router;
