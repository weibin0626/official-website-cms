import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TreeView, { TreeNodeData } from '../../components/Common/TreeView';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import * as nodesApi from '../../api/nodes';
import type { NodeItem } from '../../api/nodes';
import { useSite } from '../../hooks/useSite';

/** Convert API NodeItem tree to TreeNodeData for TreeView component */
const convertToTreeData = (items: NodeItem[]): TreeNodeData[] => {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    parentId: item.parentId,
    type: item.type,
    sort: item.sort,
    isVisible: item.isVisible,
    code: item.code,
    template: item.template,
    description: item.description,
    children: convertToTreeData(item.children || []),
  }));
};

/** Node form state */
interface NodeForm {
  name: string;
  code: string;
  type: string;
  sort: number;
  isVisible: boolean;
  template: string;
  description: string;
  parentId: string | null;
}

const emptyForm: NodeForm = {
  name: '',
  code: '',
  type: 'COLUMN',
  sort: 0,
  isVisible: true,
  template: '',
  description: '',
  parentId: null,
};

const NodesPage: React.FC = () => {
  const { currentSiteId } = useSite();
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const [form, setForm] = useState<NodeForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<TreeNodeData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch the node tree
  const fetchTree = useCallback(async () => {
    if (!currentSiteId) return;
    setLoading(true);
    try {
      const data = await nodesApi.listNodes();
      setTreeData(convertToTreeData(data));
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '获取栏目失败', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentSiteId]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  /** Handle node selection in tree */
  const handleSelect = useCallback((node: TreeNodeData) => {
    setSelectedNode(node);
    setForm({
      name: node.name,
      code: node.code || '',
      type: node.type || 'COLUMN',
      sort: node.sort ?? 0,
      isVisible: node.isVisible ?? true,
      template: node.template || '',
      description: node.description || '',
      parentId: node.parentId,
    });
    setIsEditing(true);
    setIsNew(false);
  }, []);

  /** Start creating a new root node */
  const handleAddRoot = useCallback(() => {
    setSelectedNode(null);
    setForm({ ...emptyForm, parentId: null });
    setIsEditing(true);
    setIsNew(true);
  }, []);

  /** Start creating a child node under a parent */
  const handleAddChild = useCallback((parent: TreeNodeData) => {
    setSelectedNode(parent);
    setForm({ ...emptyForm, parentId: parent.id });
    setIsEditing(true);
    setIsNew(true);
  }, []);

  /** Save (create or update) */
  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      setSnackbar({ open: true, message: '栏目名称不能为空', severity: 'error' });
      return;
    }

    try {
      if (isNew) {
        await nodesApi.createNode({
          name: form.name,
          code: form.code || undefined,
          type: form.type,
          sort: form.sort,
          isVisible: form.isVisible,
          template: form.template || undefined,
          description: form.description || undefined,
          parentId: form.parentId,
        });
        setSnackbar({ open: true, message: '创建成功', severity: 'success' });
      } else if (selectedNode) {
        await nodesApi.updateNode(selectedNode.id, {
          name: form.name,
          code: form.code || undefined,
          type: form.type,
          sort: form.sort,
          isVisible: form.isVisible,
          template: form.template || undefined,
          description: form.description || undefined,
        });
        setSnackbar({ open: true, message: '更新成功', severity: 'success' });
      }
      fetchTree();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '保存失败', severity: 'error' });
    }
  }, [form, isNew, selectedNode, fetchTree]);

  /** Initiate delete */
  const handleDeleteRequest = useCallback((node: TreeNodeData) => {
    setDeleteTarget(node);
    setDeleteDialogOpen(true);
  }, []);

  /** Confirm delete */
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await nodesApi.deleteNode(deleteTarget.id);
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
      if (selectedNode?.id === deleteTarget.id) {
        setSelectedNode(null);
        setIsEditing(false);
      }
      fetchTree();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '删除失败', severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, selectedNode, fetchTree]);

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
      {/* Left: Tree Panel */}
      <Paper sx={{ width: 300, flexShrink: 0, overflow: 'auto', p: 1 }}>
        <Typography variant="subtitle1" sx={{ px: 1, py: 1, fontWeight: 600 }}>
          栏目结构
        </Typography>
        <Divider />
        <TreeView
          data={treeData}
          selectedId={selectedNode?.id}
          onSelect={handleSelect}
          onAddChild={handleAddChild}
          onEdit={handleSelect}
          onDelete={handleDeleteRequest}
          onAddRoot={handleAddRoot}
        />
      </Paper>

      {/* Right: Detail / Edit Panel */}
      <Paper sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {!isEditing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              请在左侧选择或新增栏目
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRoot}>
              新增根栏目
            </Button>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                {isNew ? (form.parentId ? '新增子栏目' : '新增根栏目') : '编辑栏目'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!isNew && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => selectedNode && handleDeleteRequest(selectedNode)}
                  >
                    删除
                  </Button>
                )}
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                  保存
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 600 }}>
              <TextField
                label="栏目名称"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="栏目编码"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="唯一标识，如 about-us"
                fullWidth
                size="small"
              />
              <FormControl size="small" fullWidth>
                <InputLabel>栏目类型</InputLabel>
                <Select
                  value={form.type}
                  label="栏目类型"
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <MenuItem value="COLUMN">分类栏目</MenuItem>
                  <MenuItem value="PAGE">单页面</MenuItem>
                  <MenuItem value="LINK">外部链接</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="排序"
                type="number"
                value={form.sort}
                onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value, 10) || 0 })}
                fullWidth
                size="small"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isVisible}
                    onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                  />
                }
                label="是否可见"
              />
              <TextField
                label="模板"
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
                placeholder="页面模板名称"
                fullWidth
                size="small"
              />
              <TextField
                label="描述"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
                size="small"
              />
            </Box>
          </Box>
        )}
      </Paper>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="删除栏目"
        message={`确定要删除栏目「${deleteTarget?.name}」吗？删除前请确保该栏目下没有子栏目和文章。`}
        confirmText="删除"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
      />

      {/* Snackbar for status messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NodesPage;
