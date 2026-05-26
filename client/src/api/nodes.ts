import apiClient from './client';

export interface NodeItem {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  code: string | null;
  type: string;
  sort: number;
  isVisible: boolean;
  template: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  children: NodeItem[];
}

export interface CreateNodeParams {
  parentId?: string | null;
  name: string;
  code?: string;
  type?: string;
  sort?: number;
  isVisible?: boolean;
  template?: string;
  description?: string;
}

export interface UpdateNodeParams extends Partial<CreateNodeParams> {}

export interface SortNodeItem {
  id: string;
  sort: number;
  parentId?: string | null;
}

/** Fetch the node tree for the current site */
export const listNodes = async (): Promise<NodeItem[]> => {
  const response = await apiClient.get('/nodes');
  return response.data.data;
};

/** Get a single node by ID */
export const getNode = async (id: string): Promise<NodeItem> => {
  const response = await apiClient.get(`/nodes/${id}`);
  return response.data.data;
};

/** Create a new node */
export const createNode = async (data: CreateNodeParams): Promise<NodeItem> => {
  const response = await apiClient.post('/nodes', data);
  return response.data.data;
};

/** Update an existing node */
export const updateNode = async (id: string, data: UpdateNodeParams): Promise<NodeItem> => {
  const response = await apiClient.put(`/nodes/${id}`, data);
  return response.data.data;
};

/** Delete a node */
export const deleteNode = async (id: string): Promise<void> => {
  await apiClient.delete(`/nodes/${id}`);
};

/** Batch update sort order */
export const sortNodes = async (items: SortNodeItem[]): Promise<void> => {
  await apiClient.put('/nodes/sort', { items });
};

export default {
  listNodes,
  getNode,
  createNode,
  updateNode,
  deleteNode,
  sortNodes,
};
