import { Router } from 'express';
import authRoutes from './auth.routes';
import sitesRoutes from './sites.routes';
import usersRoutes from './users.routes';
import nodesRoutes from './nodes.routes';
import articlesRoutes from './articles.routes';
import mediaRoutes from './media.routes';
import bannersRoutes from './banners.routes';
import friendlinksRoutes from './friendlinks.routes';
import leadersRoutes from './leaders.routes';
import teachersRoutes from './teachers.routes';
import navitemsRoutes from './navitems.routes';
import quicklinksRoutes from './quicklinks.routes';
import notificationsRoutes from './notifications.routes';
import auditlogsRoutes from './auditlogs.routes';
import departmentsRoutes from './departments.routes';
import recyclebinRoutes from './recyclebin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sites', sitesRoutes);
router.use('/users', usersRoutes);
router.use('/nodes', nodesRoutes);
router.use('/articles', articlesRoutes);
router.use('/media', mediaRoutes);
router.use('/banners', bannersRoutes);
router.use('/friend-links', friendlinksRoutes);
router.use('/leaders', leadersRoutes);
router.use('/teachers', teachersRoutes);
router.use('/nav-items', navitemsRoutes);
router.use('/quick-links', quicklinksRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/audit-logs', auditlogsRoutes);
router.use('/departments', departmentsRoutes);
router.use('/recycle-bin', recyclebinRoutes);

export default router;
