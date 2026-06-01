import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  AlertColor,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import Toast, { useToast } from '../../components/Common/Toast';
import * as quicklinksApi from '../../api/quicklinks';
import type { QuickLink } from '../../api/quicklinks';

const colorOptions = [
  { value: '#3b82f6', label: '蓝色' },
  { value: '#10b981', label: '绿色' },
  { value: '#f59e0b', label: '黄色' },
  { value: '#ef4444', label: '红色' },
  { value: '#8b5cf6', label: '紫色' },
  { value: '#ec4899', label: '粉色' },
  { value: '#06b6d4', label: '青色' },
  { value: '#6b7280', label: '灰色' },
];

const QuickLinksPage: React.FC = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLink, setEditLink] = useState<QuickLink | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; link: QuickLink | null }>({
    open: false,
    link: null,
  });
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    url: '',
    color: '#3b82f6',
    icon: '',
    sort: 0,
    isActive: true,
  });

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await quicklinksApi.listQuickLinks();
      setLinks(data);
    } catch (error: any) {
      toast.showToast(error.message || '获取快捷入口列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleOpenCreate = () => {
    setEditLink(null);
    setForm({ name: '', url: '', color: '#3b82f6', icon: '', sort: links.length, isActive: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (link: QuickLink) => {
    setEditLink(link);
    setForm({
      name: link.name,
      url: link.url,
      color: link.color || '#3b82f6',
      icon: link.icon || '',
      sort: link.sort,
      isActive: link.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editLink) {
        await quicklinksApi.updateQuickLink(editLink.id, {
          name: form.name,
          url: form.url,
          color: form.color || undefined,
          icon: form.icon || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('快捷入口更新成功', 'success');
      } else {
        await quicklinksApi.createQuickLink({
          name: form.name,
          url: form.url,
          color: form.color || undefined,
          icon: form.icon || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('快捷入口创建成功', 'success');
      }
      setDialogOpen(false);
      fetchLinks();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.link) return;
    try {
      await quicklinksApi.deleteQuickLink(deleteConfirm.link.id);
      toast.showToast('快捷入口删除成功', 'success');
      fetchLinks();
    } catch (error: any) {
      toast.showToast(error.message || '删除失败', 'error');
    }
    setDeleteConfirm({ open: false, link: null });
  };

  const handleToggleActive = async (link: QuickLink) => {
    try {
      await quicklinksApi.updateQuickLink(link.id, { isActive: !link.isActive });
      toast.showToast(link.isActive ? '已禁用' : '已启用', 'success');
      fetchLinks();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>快捷入口管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>新增快捷入口</Button>
      </Box>

      {links.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="text.secondary">暂无快捷入口，点击上方按钮新增</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {links.map((link) => (
            <Grid item xs={12} sm={6} md={4} key={link.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      width: 12,
                      minHeight: '100%',
                      bgcolor: link.color || '#3b82f6',
                      borderRadius: '4px 0 0 4px',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, flex: 1 }}>
                    {link.icon && (
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {link.icon}
                      </Typography>
                    )}
                    <Typography variant="h6" gutterBottom>
                      {link.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        wordBreak: 'break-all',
                        mb: 1,
                      }}
                    >
                      {link.url}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={link.isActive ? '启用' : '禁用'}
                        size="small"
                        color={link.isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        排序: {link.sort}
                      </Typography>
                    </Box>
                  </CardContent>
                </Box>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Tooltip title={link.isActive ? '禁用' : '启用'}>
                    <Button
                      size="small"
                      color={link.isActive ? 'warning' : 'success'}
                      onClick={() => handleToggleActive(link)}
                    >
                      {link.isActive ? '禁用' : '启用'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="编辑">
                    <IconButton size="small" onClick={() => handleOpenEdit(link)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteConfirm({ open: true, link })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editLink ? '编辑快捷入口' : '新增快捷入口'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              size="small"
              fullWidth
            />
            <TextField
              label="链接"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              required
              size="small"
              fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel>颜色</InputLabel>
              <Select
                value={form.color}
                label="颜色"
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              >
                {colorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 1,
                          bgcolor: option.value,
                        }}
                      />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="图标"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              size="small"
              fullWidth
              placeholder="可选，图标名称或CSS类"
            />
            <TextField
              label="排序"
              type="number"
              value={form.sort}
              onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value, 10) || 0 })}
              size="small"
              fullWidth
            />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
              label="启用"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.url}>
            {editLink ? '保存' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="确认删除"
        message={`确定要删除快捷入口「${deleteConfirm.link?.name}」吗？`}
        confirmColor="error"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, link: null })}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity as AlertColor} onClose={toast.handleClose} />
    </Box>
  );
};

export default QuickLinksPage;
