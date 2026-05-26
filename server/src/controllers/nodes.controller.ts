import { Request, Response, NextFunction } from 'express';
import * as nodesService from '../services/nodes.service';
import { successResponse } from '../utils/helpers';

/**
 * GET /api/nodes — List nodes as tree for the current site
 */
export const listNodes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const tree = await nodesService.listNodes(siteId);
    res.json(successResponse(tree));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/nodes/:id — Get node detail
 */
export const getNodeById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const node = await nodesService.getNodeById(id);
    res.json(successResponse(node));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/nodes — Create a new node
 */
export const createNode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const data = {
      siteId,
      parentId: req.body.parentId || null,
      name: req.body.name,
      code: req.body.code || null,
      type: req.body.type || 'COLUMN',
      sort: req.body.sort ?? 0,
      isVisible: req.body.isVisible ?? true,
      template: req.body.template || null,
      description: req.body.description || null,
    };
    const node = await nodesService.createNode(data);
    res.status(201).json(successResponse(node, '创建成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/nodes/:id — Update a node
 */
export const updateNode = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = {
      name: req.body.name,
      code: req.body.code,
      type: req.body.type,
      sort: req.body.sort,
      isVisible: req.body.isVisible,
      template: req.body.template,
      description: req.body.description,
      parentId: req.body.parentId,
    };
    // Remove undefined fields
    Object.keys(data).forEach((key) => {
      if ((data as any)[key] === undefined) {
        delete (data as any)[key];
      }
    });
    const node = await nodesService.updateNode(id, data);
    res.json(successResponse(node, '更新成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/nodes/:id — Delete a node
 */
export const deleteNode = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await nodesService.deleteNode(id);
    res.json(successResponse(null, '删除成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/nodes/sort — Batch update node sort order
 */
export const sortNodes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items } = req.body as { items: { id: string; sort: number; parentId?: string | null }[] };
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ code: 1006, data: null, message: '排序数据不能为空' });
      return;
    }
    await nodesService.sortNodes(items);
    res.json(successResponse(null, '排序成功'));
  } catch (error) {
    next(error);
  }
};

export default {
  listNodes,
  getNodeById,
  createNode,
  updateNode,
  deleteNode,
  sortNodes,
};
