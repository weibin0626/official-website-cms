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
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
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
  const [showInactive, setShowInactive] = useState(false);
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
      const data = await sitesApi.listSites(showInactive ? undefined : 'ACTIVE');
      siteStore.setSites(data);
    } catch (error: any) {
      toast.showToast(error.message || '获取站点列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [showInactive]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSwitchSite = async (site: Site) => {
    try {
      siteStore.setCurrentSiteId(site.id);
      toast.showToast(`已切换到站点: ${site.nameCn}`, 'success');
    } catch (error: any) {
      toast.showToast(error.message || '切换站点失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.site) {
      console.error('[handleDelete] No site selected!');
      return;
    }
    console.log('[handleDelete] Deleting site:', deleteConfirm.site.id, deleteConfirm.site.nameCn);
    try {
      await sitesApi.deleteSite(deleteConfirm.site.id);
      console.log('[handleDelete] Delete API success');
      toast.showToast('站点删除成功', 'success');
      setDeleteConfirm({ open: false, site: null });
      await fetchSites();
    } catch (error: any) {
      console.error('[handleDelete] Delete failed:', error);
      toast.showToast(error.message || '删除失败', 'error');
      setDeleteConfirm({ open: false, site: null });
    }
  };

  if (!isSuperAdmin) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">仅超级管理员可管理站点</Typography>
      </Box>
    );
  }

  const currentSiteId = siteStore.currentSiteId;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>站点管理</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(_, checked) => setShowInactive(checked)}
              />
            }
            label={<Typography variant="body2" color="text.secondary">显示停用站点</Typography>}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            新增站点
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography>加载中...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {siteStore.sites.map((site) => {
            const isCurrentSite = site.id === currentSiteId;
            const firstChar = site.nameCn.charAt(0).toUpperCase();
            
            return (
              <Grid item xs={12} sm={6} md={4} key={site.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isCurrentSite ? '2px solid' : '1px solid',
                    borderColor: isCurrentSite ? 'primary.main' : 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Card Header: Avatar + Site Name + Site ID + Current Tag */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: site.primaryColor,
                          color: '#fff',
                          width: 48,
                          height: 48,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                        }}
                      >
                        {firstChar}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" fontWeight={600} noWrap>
                            {site.nameCn}
                          </Typography>
                          {isCurrentSite && (
                            <Chip
                              label="当前"
                              size="small"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {site.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.2,
                            borderRadius: 1,
                            bgcolor: site.status === 'ACTIVE' ? 'success.light' : 'grey.300',
                            color: site.status === 'ACTIVE' ? 'success.dark' : 'text.disabled',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            mt: 0.5,
                          }}
                        >
                          {site.status === 'ACTIVE' ? '启用' : '停用'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Card Body: Contact Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {site.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {site.phone}
                          </Typography>
                        </Box>
                      )}
                      {site.address && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {site.address}
                          </Typography>
                        </Box>
                      )}
                      {site.domain && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LanguageIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {site.domain}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  {/* Card Actions */}
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      variant={isCurrentSite ? 'contained' : 'outlined'}
                      onClick={() => handleSwitchSite(site)}
                      disabled={isCurrentSite}
                    >
                      {isCurrentSite ? '当前站点' : '切换'}
                    </Button>
                    <Box>
                      <Tooltip title="编辑">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(site)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {site.status === 'ACTIVE' ? (
                        <Tooltip title="删除">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm({ open: true, site })}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="启用">
                          <IconButton
                            size="small"
                            onClick={async () => {
                              try {
                                await sitesApi.updateSite(site.id, { status: 'ACTIVE' });
                                toast.showToast('站点已启用', 'success');
                                fetchSites();
                              } catch (e: any) {
                                toast.showToast(e.message || '启用失败', 'error');
                              }
                            }}
                            color="success"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

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
