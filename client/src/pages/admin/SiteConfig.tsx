import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  AlertColor,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import Toast, { useToast } from '../../components/Common/Toast';
import LoadingOverlay from '../../components/Common/LoadingOverlay';
import { useSiteStore } from '../../stores/siteStore';
import * as sitesApi from '../../api/sites';

const SiteConfigPage: React.FC = () => {
  const { currentSite, currentSiteId, fetchSites } = useSiteStore();
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [form, setForm] = useState({
    nameCn: '',
    nameEn: '',
    domain: '',
    logo: '',
    primaryColor: '#1a3a6b',
    secondaryColor: '',
    phone: '',
    email: '',
    address: '',
    icp: '',
    police: '',
    description: '',
  });

  useEffect(() => {
    if (currentSite) {
      setForm({
        nameCn: currentSite.nameCn,
        nameEn: currentSite.nameEn || '',
        domain: currentSite.domain || '',
        logo: currentSite.logo || '',
        primaryColor: currentSite.primaryColor,
        secondaryColor: currentSite.secondaryColor || '',
        phone: currentSite.phone || '',
        email: currentSite.email || '',
        address: currentSite.address || '',
        icp: currentSite.icp || '',
        police: currentSite.police || '',
        description: currentSite.description || '',
      });
    }
  }, [currentSite]);

  const handleSave = async () => {
    if (!currentSiteId) return;
    setSaving(true);
    try {
      await sitesApi.updateSite(currentSiteId, {
        nameCn: form.nameCn,
        nameEn: form.nameEn || undefined,
        domain: form.domain || undefined,
        logo: form.logo || undefined,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        icp: form.icp || undefined,
        police: form.police || undefined,
        description: form.description || undefined,
      });
      toast.showToast('站点配置保存成功', 'success');
      fetchSites();
    } catch (error: any) {
      toast.showToast(error.message || '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!currentSiteId) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">请先选择一个站点</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>站点配置</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          保存配置
        </Button>
      </Box>

      <Paper sx={{ p: 3, position: 'relative' }}>
        <LoadingOverlay open={saving} message="保存中..." />

        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>基本信息</Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="站点中文名"
              value={form.nameCn}
              onChange={(e) => setForm({ ...form, nameCn: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="站点英文名"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Logo URL"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              size="small"
              placeholder="https://example.com/logo.png"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="域名"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              size="small"
              placeholder="https://example.com"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="联系电话"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="邮箱"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              size="small"
              placeholder="contact@example.com"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="地址"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="站点描述"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              size="small"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>主题配置</Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="主色调"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: form.primaryColor,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="副色调"
                value={form.secondaryColor}
                onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                size="small"
                sx={{ flexGrow: 1 }}
              />
              {form.secondaryColor && (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: form.secondaryColor,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}
            </Box>
          </Grid>
        </Grid>

        <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>备案信息</Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ICP备案号"
              value={form.icp}
              onChange={(e) => setForm({ ...form, icp: e.target.value })}
              size="small"
              placeholder="苏ICP备XXXXXXXX号"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="公安备案号"
              value={form.police}
              onChange={(e) => setForm({ ...form, police: e.target.value })}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity as AlertColor}
        onClose={toast.handleClose}
      />
    </Box>
  );
};

export default SiteConfigPage;
