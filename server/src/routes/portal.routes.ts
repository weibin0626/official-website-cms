import { Router } from 'express';
import * as portalController from '../controllers/portal.controller';

const router = Router();

// Public portal routes — no auth required
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
