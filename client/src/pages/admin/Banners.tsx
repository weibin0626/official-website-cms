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
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import Toast, { useToast } from '../../components/Common/Toast';
import * as bannersApi from '../../api/banners';
import type { Banner } from '../../api/banners';

const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; banner: Banner | null }>({
    open: false,
    banner: null,
  });
  const toast = useToast();

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    sort: 0,
    isActive: true,
  });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bannersApi.listBanners();
      setBanners(data);
    } catch (error: any) {
      toast.showToast(error.message || '获取轮播图列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenCreate = () => {
    setEditBanner(null);
    setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', sort: banners.length, isActive: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditBanner(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      sort: banner.sort,
      isActive: banner.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editBanner) {
        await bannersApi.updateBanner(editBanner.id, {
          title: form.title,
          subtitle: form.subtitle || undefined,
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('轮播图更新成功', 'success');
      } else {
        await bannersApi.createBanner({
          title: form.title,
          subtitle: form.subtitle || undefined,
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('轮播图创建成功', 'success');
      }
      setDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.banner) return;
    try {
      await bannersApi.deleteBanner(deleteConfirm.banner.id);
      toast.showToast('轮播图删除成功', 'success');
      fetchBanners();
    } catch (error: any) {
      toast.showToast(error.message || '删除失败', 'error');
    }
    setDeleteConfirm({ open: false, banner: null });
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await bannersApi.updateBanner(banner.id, { isActive: !banner.isActive });
      toast.showToast(banner.isActive ? '已禁用' : '已启用', 'success');
      fetchBanners();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleMoveUp = async (banner: Banner, index: number) => {
    if (index === 0) return;
    const items = banners.map((b, i) => ({ id: b.id, sort: b.sort }));
    const temp = items[index].sort;
    items[index].sort = items[index - 1].sort;
    items[index - 1].sort = temp;
    try {
      await bannersApi.sortBanners(items);
      fetchBanners();
    } catch (error: any) {
      toast.showToast(error.message || '排序失败', 'error');
    }
  };

  const handleMoveDown = async (banner: Banner, index: number) => {
    if (index === banners.length - 1) return;
    const items = banners.map((b, i) => ({ id: b.id, sort: b.sort }));
    const temp = items[index].sort;
    items[index].sort = items[index + 1].sort;
    items[index + 1].sort = temp;
    try {
      await bannersApi.sortBanners(items);
      fetchBanners();
    } catch (error: any) {
      toast.showToast(error.message || '排序失败', 'error');
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
        <Typography variant="h5" fontWeight={600}>轮播图管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          新增轮播图
        </Button>
      </Box>

      {banners.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="text.secondary">暂无轮播图，点击上方按钮新增</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {banners.map((banner, index) => (
            <Grid item xs={12} sm={6} md={4} key={banner.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  component="img"
                  src={banner.imageUrl}
                  alt={banner.title}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    bgcolor: 'grey.100',
                  }}
                  onError={(e: any) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'; }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {banner.title}
                  </Typography>
                  {banner.subtitle && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {banner.subtitle}
                    </Typography>
                  )}
                  {banner.linkUrl && (
                    <Typography variant="body2" color="primary" sx={{ wordBreak: 'break-all' }}>
                      链接: {banner.linkUrl}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={banner.isActive ? '启用' : '禁用'}
                      size="small"
                      color={banner.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      排序: {banner.sort}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="上移">
                      <IconButton
                        size="small"
                        onClick={() => handleMoveUp(banner, index)}
                        disabled={index === 0}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="下移">
                      <IconButton
                        size="small"
                        onClick={() => handleMoveDown(banner, index)}
                        disabled={index === banners.length - 1}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={banner.isActive ? '禁用' : '启用'}>
                      <Button
                        size="small"
                        color={banner.isActive ? 'warning' : 'success'}
                        onClick={() => handleToggleActive(banner)}
                      >
                        {banner.isActive ? '禁用' : '启用'}
                      </Button>
                    </Tooltip>
                    <Tooltip title="编辑">
                      <IconButton size="small" onClick={() => handleOpenEdit(banner)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirm({ open: true, banner })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editBanner ? '编辑轮播图' : '新增轮播图'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="标题"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              size="small"
              fullWidth
            />
            <TextField
              label="副标题"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              size="small"
              fullWidth
              placeholder="可选，轮播图副标题"
            />
            <TextField
              label="图片地址"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              required
              size="small"
              fullWidth
              helperText="输入图片URL地址"
            />
            <TextField
              label="链接地址"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              size="small"
              fullWidth
              placeholder="可选，点击后跳转的链接"
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
          <Button variant="contained" onClick={handleSave} disabled={!form.title || !form.imageUrl}>
            {editBanner ? '保存' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="确认删除"
        message={`确定要删除轮播图「${deleteConfirm.banner?.title}」吗？`}
        confirmColor="error"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, banner: null })}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity as AlertColor} onClose={toast.handleClose} />
    </Box>
  );
};

export default BannersPage;
