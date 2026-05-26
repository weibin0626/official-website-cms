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
  Chip,
  AlertColor,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable, { Column } from '../../components/Common/DataTable';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import Toast, { useToast } from '../../components/Common/Toast';
import * as quicklinksApi from '../../api/quicklinks';
import type { QuickLink } from '../../api/quicklinks';

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
    setForm({ name: '', url: '', icon: '', sort: links.length, isActive: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (link: QuickLink) => {
    setEditLink(link);
    setForm({
      name: link.name,
      url: link.url,
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
          icon: form.icon || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('快捷入口更新成功', 'success');
      } else {
        await quicklinksApi.createQuickLink({
          name: form.name,
          url: form.url,
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

  const columns: Column<QuickLink>[] = [
    {
      id: 'icon',
      label: '图标',
      width: 80,
      render: (row) => row.icon || '-',
    },
    { id: 'name', label: '名称', width: 150 },
    { id: 'url', label: '链接', width: 250 },
    { id: 'sort', label: '排序', width: 80 },
    {
      id: 'isActive',
      label: '状态',
      width: 80,
      render: (row) => (
        <Chip label={row.isActive ? '启用' : '禁用'} size="small" color={row.isActive ? 'success' : 'default'} variant="outlined" />
      ),
    },
    {
      id: 'actions',
      label: '操作',
      width: 220,
      align: 'left',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(row)}>编辑</Button>
          <Button size="small" color={row.isActive ? 'warning' : 'success'} onClick={() => handleToggleActive(row)}>
            {row.isActive ? '禁用' : '启用'}
          </Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteConfirm({ open: true, link: row })}>删除</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>快捷入口管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>新增快捷入口</Button>
      </Box>

      <DataTable
        columns={columns}
        rows={links}
        total={links.length}
        page={1}
        pageSize={100}
        loading={loading}
        searchable={false}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        getRowId={(row) => row.id}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editLink ? '编辑快捷入口' : '新增快捷入口'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required size="small" />
            <TextField label="链接" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required size="small" />
            <TextField label="图标" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} size="small" placeholder="可选，图标名称或CSS类" />
            <TextField label="排序" type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value, 10) || 0 })} size="small" />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="启用" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.url}>{editLink ? '保存' : '创建'}</Button>
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
