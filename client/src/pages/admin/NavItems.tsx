import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  AlertColor,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import Toast, { useToast } from '../../components/Common/Toast';
import * as navitemsApi from '../../api/navitems';
import type { NavItem } from '../../api/navitems';

const NavItemsPage: React.FC = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<NavItem | null>(null);
  const [parentForNew, setParentForNew] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: NavItem | null }>({
    open: false,
    item: null,
  });
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    url: '',
    icon: '',
    isActive: true,
  });

  const fetchNavItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await navitemsApi.listNavItems();
      setNavItems(data);
    } catch (error: any) {
      toast.showToast(error.message || '获取导航列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavItems();
  }, [fetchNavItems]);

  /** Find item by ID in tree */
  const findItemById = (items: NavItem[], id: string): NavItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      const found = findItemById(item.children, id);
      if (found) return found;
    }
    return null;
  };

  /** Find siblings at the same parent level */
  const findSiblings = (items: NavItem[], id: string): NavItem[] | null => {
    for (const item of items) {
      if (item.id === id) return items;
      const found = findSiblings(item.children, id);
      if (found) return found;
    }
    return null;
  };

  const selectedItem = selectedId ? findItemById(navItems, selectedId) : null;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenCreateRoot = () => {
    setEditItem(null);
    setParentForNew(null);
    setForm({ name: '', url: '', icon: '', isActive: true });
    setDialogOpen(true);
  };

  const handleOpenCreateChild = (parentId: string) => {
    setEditItem(null);
    setParentForNew(parentId);
    setForm({ name: '', url: '', icon: '', isActive: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: NavItem) => {
    setEditItem(item);
    setParentForNew(null);
    setForm({
      name: item.name,
      url: item.url || '',
      icon: item.icon || '',
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await navitemsApi.updateNavItem(editItem.id, {
          name: form.name,
          url: form.url || undefined,
          icon: form.icon || undefined,
          isActive: form.isActive,
        });
        toast.showToast('导航项更新成功', 'success');
      } else {
        await navitemsApi.createNavItem({
          parentId: parentForNew || undefined,
          name: form.name,
          url: form.url || undefined,
          icon: form.icon || undefined,
          isActive: form.isActive,
        });
        toast.showToast('导航项创建成功', 'success');
      }
      setDialogOpen(false);
      fetchNavItems();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      await navitemsApi.deleteNavItem(deleteConfirm.item.id);
      toast.showToast('导航项删除成功', 'success');
      if (selectedId === deleteConfirm.item.id) setSelectedId(null);
      fetchNavItems();
    } catch (error: any) {
      toast.showToast(error.message || '删除失败', 'error');
    }
    setDeleteConfirm({ open: false, item: null });
  };

  const handleToggleActive = async (item: NavItem) => {
    try {
      await navitemsApi.updateNavItem(item.id, { isActive: !item.isActive });
      toast.showToast(item.isActive ? '已禁用' : '已启用', 'success');
      fetchNavItems();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleMoveUp = async (item: NavItem) => {
    const siblings = findSiblings(navItems, item.id);
    if (!siblings) return;
    const index = siblings.findIndex((s) => s.id === item.id);
    if (index <= 0) return;
    const items = siblings.map((s) => ({ id: s.id, sort: s.sort }));
    const temp = items[index].sort;
    items[index].sort = items[index - 1].sort;
    items[index - 1].sort = temp;
    try {
      await navitemsApi.sortNavItems(items);
      fetchNavItems();
    } catch (error: any) {
      toast.showToast(error.message || '排序失败', 'error');
    }
  };

  const handleMoveDown = async (item: NavItem) => {
    const siblings = findSiblings(navItems, item.id);
    if (!siblings) return;
    const index = siblings.findIndex((s) => s.id === item.id);
    if (index === -1 || index >= siblings.length - 1) return;
    const items = siblings.map((s) => ({ id: s.id, sort: s.sort }));
    const temp = items[index].sort;
    items[index].sort = items[index + 1].sort;
    items[index + 1].sort = temp;
    try {
      await navitemsApi.sortNavItems(items);
      fetchNavItems();
    } catch (error: any) {
      toast.showToast(error.message || '排序失败', 'error');
    }
  };

  /** Render tree using List components */
  const renderTreeItems = (items: NavItem[], depth: number = 0) =>
    items.map((item) => {
      const hasChildren = item.children.length > 0;
      const isExpanded = expandedIds.has(item.id);
      const isSelected = selectedId === item.id;

      return (
        <React.Fragment key={item.id}>
          <ListItemButton
            selected={isSelected}
            onClick={() => setSelectedId(item.id)}
            sx={{
              pl: 2 + depth * 2,
              borderLeft: depth > 0 ? '2px solid' : 'none',
              borderColor: 'primary.light',
            }}
          >
            {hasChildren && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(item.id);
                }}
                sx={{ mr: 0.5 }}
              >
                {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            )}
            {!hasChildren && <Box sx={{ width: 28, mr: 0.5 }} />}
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{item.name}</Typography>
                  <Chip
                    label={item.isActive ? '启用' : '禁用'}
                    size="small"
                    color={item.isActive ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                </Box>
              }
            />
          </ListItemButton>
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              {renderTreeItems(item.children, depth + 1)}
            </Collapse>
          )}
        </React.Fragment>
      );
    });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>导航管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateRoot}>
          新增根导航
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Left: Tree */}
        <Paper variant="outlined" sx={{ width: 320, minHeight: 400, p: 1, overflow: 'auto' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, py: 0.5 }}>导航树</Typography>
          {loading ? (
            <Typography color="text.secondary" sx={{ px: 1 }}>加载中...</Typography>
          ) : navItems.length === 0 ? (
            <Typography color="text.secondary" sx={{ px: 1 }}>暂无导航项</Typography>
          ) : (
            <List dense disablePadding>
              {renderTreeItems(navItems)}
            </List>
          )}
        </Paper>

        {/* Right: Detail / Edit */}
        <Paper variant="outlined" sx={{ flex: 1, p: 2, minHeight: 400 }}>
          {selectedItem ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>{selectedItem.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenCreateChild(selectedItem.id)}>
                    添加子导航
                  </Button>
                  <IconButton size="small" onClick={() => handleMoveUp(selectedItem)} title="上移">
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleMoveDown(selectedItem)} title="下移">
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2"><strong>名称：</strong>{selectedItem.name}</Typography>
                <Typography variant="body2"><strong>链接：</strong>{selectedItem.url || '-'}</Typography>
                <Typography variant="body2"><strong>图标：</strong>{selectedItem.icon || '-'}</Typography>
                <Typography variant="body2"><strong>排序：</strong>{selectedItem.sort}</Typography>
                <Typography variant="body2">
                  <strong>状态：</strong>
                  <Chip
                    label={selectedItem.isActive ? '启用' : '禁用'}
                    size="small"
                    color={selectedItem.isActive ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenEdit(selectedItem)}>
                  编辑
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color={selectedItem.isActive ? 'warning' : 'success'}
                  onClick={() => handleToggleActive(selectedItem)}
                >
                  {selectedItem.isActive ? '禁用' : '启用'}
                </Button>
                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteConfirm({ open: true, item: selectedItem })}>
                  删除
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
              <Typography>请在左侧选择一个导航项</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editItem ? '编辑导航项' : parentForNew ? '新增子导航' : '新增根导航'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required size="small" />
            <TextField label="链接" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} size="small" placeholder="可选" />
            <TextField label="图标" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} size="small" placeholder="可选，图标名称" />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="启用" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>{editItem ? '保存' : '创建'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="确认删除"
        message={`确定要删除导航项「${deleteConfirm.item?.name}」吗？其子导航也将被删除。`}
        confirmColor="error"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, item: null })}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity as AlertColor} onClose={toast.handleClose} />
    </Box>
  );
};

export default NavItemsPage;
