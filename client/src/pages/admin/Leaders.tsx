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
  Avatar,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import Toast, { useToast } from '../../components/Common/Toast';
import * as leadersApi from '../../api/leaders';
import type { Leader } from '../../api/leaders';

const LeadersPage: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLeader, setEditLeader] = useState<Leader | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; leader: Leader | null }>({
    open: false,
    leader: null,
  });
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    position: '',
    photo: '',
    bio: '',
    sort: 0,
    isActive: true,
  });

  const fetchLeaders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leadersApi.listLeaders();
      setLeaders(data);
    } catch (error: any) {
      toast.showToast(error.message || '获取领导列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  const handleOpenCreate = () => {
    setEditLeader(null);
    setForm({ name: '', position: '', photo: '', bio: '', sort: leaders.length, isActive: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (leader: Leader) => {
    setEditLeader(leader);
    setForm({
      name: leader.name,
      position: leader.position,
      photo: leader.photo || '',
      bio: leader.bio || '',
      sort: leader.sort,
      isActive: leader.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editLeader) {
        await leadersApi.updateLeader(editLeader.id, {
          name: form.name,
          position: form.position,
          photo: form.photo || undefined,
          bio: form.bio || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('领导更新成功', 'success');
      } else {
        await leadersApi.createLeader({
          name: form.name,
          position: form.position,
          photo: form.photo || undefined,
          bio: form.bio || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('领导创建成功', 'success');
      }
      setDialogOpen(false);
      fetchLeaders();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.leader) return;
    try {
      await leadersApi.deleteLeader(deleteConfirm.leader.id);
      toast.showToast('领导删除成功', 'success');
      fetchLeaders();
    } catch (error: any) {
      toast.showToast(error.message || '删除失败', 'error');
    }
    setDeleteConfirm({ open: false, leader: null });
  };

  const handleToggleActive = async (leader: Leader) => {
    try {
      await leadersApi.updateLeader(leader.id, { isActive: !leader.isActive });
      toast.showToast(leader.isActive ? '已禁用' : '已启用', 'success');
      fetchLeaders();
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
        <Typography variant="h5" fontWeight={600}>领导管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>新增领导</Button>
      </Box>

      {leaders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="text.secondary">暂无领导信息，点击上方按钮新增</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {leaders.map((leader) => (
            <Grid item xs={12} sm={6} md={4} key={leader.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {leader.photo ? (
                      <Avatar
                        src={leader.photo}
                        alt={leader.name}
                        sx={{ width: 80, height: 80, borderRadius: 2 }}
                        variant="rounded"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <Avatar
                        sx={{ width: 80, height: 80, borderRadius: 2, bgcolor: 'grey.200', fontSize: 32, color: 'grey.500' }}
                        variant="rounded"
                      >
                        {leader.name.charAt(0)}
                      </Avatar>
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {leader.name}
                      </Typography>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {leader.position}
                      </Typography>
                      <Chip
                        label={leader.isActive ? '启用' : '禁用'}
                        size="small"
                        color={leader.isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  {leader.bio && (
                    <Typography variant="body2" color="text.secondary" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {leader.bio}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    排序: {leader.sort}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Tooltip title={leader.isActive ? '禁用' : '启用'}>
                    <Button
                      size="small"
                      color={leader.isActive ? 'warning' : 'success'}
                      onClick={() => handleToggleActive(leader)}
                    >
                      {leader.isActive ? '禁用' : '启用'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="编辑">
                    <IconButton size="small" onClick={() => handleOpenEdit(leader)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteConfirm({ open: true, leader })}
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
        <DialogTitle>{editLeader ? '编辑领导' : '新增领导'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required size="small" fullWidth />
            <TextField label="职务" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required size="small" fullWidth />
            <TextField label="照片地址" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} size="small" fullWidth placeholder="可选，照片URL" />
            <TextField label="简介" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} size="small" fullWidth multiline rows={3} />
            <TextField label="排序" type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value, 10) || 0 })} size="small" fullWidth />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="启用" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.position}>{editLeader ? '保存' : '创建'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="确认删除"
        message={`确定要删除领导「${deleteConfirm.leader?.name}」吗？`}
        confirmColor="error"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, leader: null })}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity as AlertColor} onClose={toast.handleClose} />
    </Box>
  );
};

export default LeadersPage;
