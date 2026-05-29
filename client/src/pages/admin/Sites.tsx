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
  AlertColor,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable, { Column } from '../../components/Common/DataTable';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import Toast, { useToast } from '../../components/Common/Toast';
import { usePermission } from '../../hooks/usePermission';
import * as sitesApi from '../../api/sites';
import type { Site } from '../../api/sites';
import { useSiteStore } from '../../stores/siteStore';

const SitesPage: React.FC = () => {
  const { isSuperAdmin } = usePermission();
  const siteStore = useSiteStore();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; site: Site | null }>({
    open: false,
    site: null,
  });
  const toast = useToast();

  // Form state
  const [form, setForm] = useState({
    name: '',
    nameCn: '',
    nameEn: '',
    domain: '',
    primaryColor: '#1a3a6b',
    phone: '',
    address: '',
    icp: '',
    police: '',
    description: '',
    status: 'ACTIVE',
  });

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await sitesApi.listSites();
      siteStore.setSites(data);
    } catch (error: any) {
      toast.showToast(error.message || '获取站点列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCreate = () => {
    setEditSite(null);
    setForm({
      name: '',
      nameCn: '',
      nameEn: '',
      domain: '',
      primaryColor: '#1a3a6b',
      phone: '',
      address: '',
      icp: '',
      police: '',
      description: '',
      status: 'ACTIVE',
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (site: Site) => {
    setEditSite(site);
    setForm({
      name: site.name,
      nameCn: site.nameCn,
      nameEn: site.nameEn || '',
      domain: site.domain || '',
      primaryColor: site.primaryColor,
      phone: site.phone || '',
      address: site.address || '',
      icp: site.icp || '',
      police: site.police || '',
      description: site.description || '',
      status: site.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editSite) {
        await sitesApi.updateSite(editSite.id, form);
        toast.showToast('站点更新成功', 'success');
      } else {
        await sitesApi.createSite(form);
        toast.showToast('站点创建成功', 'success');
      }
      setDialogOpen(false);
      fetchSites();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.site) return;
    try {
      await sitesApi.deleteSite(deleteConfirm.site.id);
      toast.showToast('站点删除成功', 'success');
      fetchSites();
    } catch (error: any) {
      toast.showToast(error.message || '删除失败', 'error');
    }
    setDeleteConfirm({ open: false, site: null });
  };

  const columns: Column<Site>[] = [
    { id: 'name', label: '标识', width: 120 },
    { id: 'nameCn', label: '中文名', width: 180 },
    { id: 'primaryColor', label: '主色', width: 100, render: (row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: row.primaryColor }} />
        {row.primaryColor}
      </Box>
    )},
    { id: 'status', label: '状态', width: 80, render: (row) => (
      <Typography
        variant="body2"
        sx={{
          color: row.status === 'ACTIVE' ? 'success.main' : 'text.disabled',
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      >
        {row.status === 'ACTIVE' ? '启用' : '停用'}
      </Typography>
    )},
    { id: 'phone', label: '电话', width: 150 },
    { id: 'actions', label: '操作', width: 150, align: 'center', render: (row) => (
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => handleOpenEdit(row)}
        >
          编辑
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteConfirm({ open: true, site: row })}
        >
          删除
        </Button>
      </Box>
    )},
  ];

  if (!isSuperAdmin) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">仅超级管理员可管理站点</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>站点管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          新增站点
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={siteStore.sites}
        total={siteStore.sites.length}
        page={1}
        pageSize={100}
        loading={loading}
        searchable={false}
        getRowId={(row) => row.id}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editSite ? '编辑站点' : '新增站点'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="站点标识"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={!!editSite}
              size="small"
              helperText="唯一标识，创建后不可修改"
            />
            <TextField
              label="中文名称"
              value={form.nameCn}
              onChange={(e) => setForm({ ...form, nameCn: e.target.value })}
              required
              size="small"
            />
            <TextField
              label="英文名称"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              size="small"
            />
            <TextField
              label="域名"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              size="small"
            />
            <TextField
              label="主色调"
              value={form.primaryColor}
              onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
              size="small"
              type="color"
              InputProps={{
                sx: { height: 40 },
              }}
            />
            <TextField
              label="电话"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              size="small"
            />
            <TextField
              label="地址"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              size="small"
            />
            <TextField
              label="ICP备案"
              value={form.icp}
              onChange={(e) => setForm({ ...form, icp: e.target.value })}
              size="small"
            />
            <TextField
              label="公安备案"
              value={form.police}
              onChange={(e) => setForm({ ...form, police: e.target.value })}
              size="small"
            />
            <TextField
              label="描述"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              size="small"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.nameCn}>
            {editSite ? '保存' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="确认删除"
        message={`确定要删除站点「${deleteConfirm.site?.nameCn}」吗？此操作将停用该站点。`}
        confirmColor="error"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, site: null })}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity as AlertColor}
        onClose={toast.handleClose}
      />
    </Box>
  );
};

export default SitesPage;
