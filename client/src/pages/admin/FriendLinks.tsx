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
import * as friendlinksApi from '../../api/friendlinks';
import type { FriendLink } from '../../api/friendlinks';

const FriendLinksPage: React.FC = () => {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLink, setEditLink] = useState<FriendLink | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; link: FriendLink | null }>({
    open: false,
    link: null,
  });
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    url: '',
    logo: '',
    sort: 0,
    isActive: true,
  });

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await friendlinksApi.listFriendLinks();
      setLinks(data);
    } catch (error: any) {
      toast.showToast(error.message || '获取友情链接列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleOpenCreate = () => {
    setEditLink(null);
    setForm({ name: '', url: '', logo: '', sort: links.length, isActive: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (link: FriendLink) => {
    setEditLink(link);
    setForm({
      name: link.name,
      url: link.url,
      logo: link.logo || '',
      sort: link.sort,
      isActive: link.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editLink) {
        await friendlinksApi.updateFriendLink(editLink.id, {
          name: form.name,
          url: form.url,
          logo: form.logo || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('友情链接更新成功', 'success');
      } else {
        await friendlinksApi.createFriendLink({
          name: form.name,
          url: form.url,
          logo: form.logo || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('友情链接创建成功', 'success');
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
      await friendlinksApi.deleteFriendLink(deleteConfirm.link.id);
      toast.showToast('友情链接删除成功', 'success');
      fetchLinks();
    } catch (error: any) {
      toast.showToast(error.message || '删除失败', 'error');
    }
    setDeleteConfirm({ open: false, link: null });
  };

  const handleToggleActive = async (link: FriendLink) => {
    try {
      await friendlinksApi.updateFriendLink(link.id, { isActive: !link.isActive });
      toast.showToast(link.isActive ? '已禁用' : '已启用', 'success');
      fetchLinks();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const columns: Column<FriendLink>[] = [
    { id: 'name', label: '名称', width: 150 },
    { id: 'url', label: 'URL', width: 250 },
    {
      id: 'logo',
      label: 'Logo',
      width: 80,
      render: (row) =>
        row.logo ? (
          <Box component="img" src={row.logo} alt={row.name} sx={{ width: 30, height: 30, objectFit: 'contain' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
        ) : '-',
    },
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
        <Typography variant="h5" fontWeight={600}>友情链接管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>新增友情链接</Button>
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
        <DialogTitle>{editLink ? '编辑友情链接' : '新增友情链接'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required size="small" />
            <TextField label="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required size="small" />
            <TextField label="Logo地址" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} size="small" placeholder="可选，Logo图片URL" />
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
        message={`确定要删除友情链接「${deleteConfirm.link?.name}」吗？`}
        confirmColor="error"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, link: null })}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity as AlertColor} onClose={toast.handleClose} />
    </Box>
  );
};

export default FriendLinksPage;
