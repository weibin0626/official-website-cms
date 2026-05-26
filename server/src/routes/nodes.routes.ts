import { Router } from 'express';
import * as nodesController from '../controllers/nodes.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// All node routes require authentication and site context
router.use(authMiddleware);
router.use(siteContextMiddleware);

// List nodes as tree (read-only, no specific permission required beyond auth)
router.get(
  '/',
  nodesController.listNodes,
);

// Get node detail
router.get(
  '/:id',
  nodesController.getNodeById,
);

// Create node — requires nodes:create
router.post(
  '/',
  rbac('node:create'),
  auditLog({ action: 'CREATE', resource: 'node' }),
  nodesController.createNode,
);

// Sort nodes — requires nodes:update (must be before /:id routes)
router.put(
  '/sort',
  rbac('node:update'),
  auditLog({ action: 'SORT', resource: 'node' }),
  nodesController.sortNodes,
);

// Update node — requires nodes:update
router.put(
  '/:id',
  rbac('node:update'),
  auditLog({ action: 'UPDATE', resource: 'node' }),
  nodesController.updateNode,
);

// Delete node — requires nodes:delete
router.delete(
  '/:id',
  rbac('node:delete'),
  auditLog({ action: 'DELETE', resource: 'node' }),
  nodesController.deleteNode,
);

export default router;
