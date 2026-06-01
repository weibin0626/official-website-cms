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
import * as teachersApi from '../../api/teachers';
import type { Teacher } from '../../api/teachers';

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; teacher: Teacher | null }>({
    open: false,
    teacher: null,
  });
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    title: '',
    subject: '',
    years: 0,
    photo: '',
    bio: '',
    sort: 0,
    isActive: true,
  });

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teachersApi.listTeachers();
      setTeachers(data);
    } catch (error: any) {
      toast.showToast(error.message || '获取师资列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleOpenCreate = () => {
    setEditTeacher(null);
    setForm({ name: '', title: '', subject: '', years: 0, photo: '', bio: '', sort: teachers.length, isActive: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setForm({
      name: teacher.name,
      title: teacher.title || '',
      subject: teacher.subject || '',
      years: teacher.years || 0,
      photo: teacher.photo || '',
      bio: teacher.bio || '',
      sort: teacher.sort,
      isActive: teacher.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editTeacher) {
        await teachersApi.updateTeacher(editTeacher.id, {
          name: form.name,
          title: form.title || undefined,
          subject: form.subject || undefined,
          years: form.years || undefined,
          photo: form.photo || undefined,
          bio: form.bio || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('教师更新成功', 'success');
      } else {
        await teachersApi.createTeacher({
          name: form.name,
          title: form.title || undefined,
          subject: form.subject || undefined,
          years: form.years || undefined,
          photo: form.photo || undefined,
          bio: form.bio || undefined,
          sort: form.sort,
          isActive: form.isActive,
        });
        toast.showToast('教师创建成功', 'success');
      }
      setDialogOpen(false);
      fetchTeachers();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.teacher) return;
    try {
      await teachersApi.deleteTeacher(deleteConfirm.teacher.id);
      toast.showToast('教师删除成功', 'success');
      fetchTeachers();
    } catch (error: any) {
      toast.showToast(error.message || '删除失败', 'error');
    }
    setDeleteConfirm({ open: false, teacher: null });
  };

  const handleToggleActive = async (teacher: Teacher) => {
    try {
      await teachersApi.updateTeacher(teacher.id, { isActive: !teacher.isActive });
      toast.showToast(teacher.isActive ? '已禁用' : '已启用', 'success');
      fetchTeachers();
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
        <Typography variant="h5" fontWeight={600}>师资管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>新增教师</Button>
      </Box>

      {teachers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="text.secondary">暂无师资信息，点击上方按钮新增</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {teachers.map((teacher) => (
            <Grid item xs={12} sm={6} md={3} key={teacher.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  component="img"
                  src={teacher.photo || ''}
                  alt={teacher.name}
                  sx={{
                    width: '100%',
                    height: 150,
                    objectFit: 'cover',
                    bgcolor: 'grey.100',
                  }}
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
                {!teacher.photo && (
                  <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                    <Avatar
                      sx={{ width: 80, height: 80, fontSize: 32, bgcolor: 'primary.main' }}
                    >
                      {teacher.name.charAt(0)}
                    </Avatar>
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {teacher.name}
                  </Typography>
                  <Typography variant="body2" color="primary" gutterBottom>
                    {teacher.title || '暂无职称'}
                  </Typography>
                  {teacher.subject && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      学科: {teacher.subject}
                    </Typography>
                  )}
                  {teacher.years !== null && teacher.years !== undefined && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      教龄: {teacher.years}年
                    </Typography>
                  )}
                  {teacher.bio && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {teacher.bio}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={teacher.isActive ? '启用' : '禁用'}
                      size="small"
                      color={teacher.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      排序: {teacher.sort}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Tooltip title={teacher.isActive ? '禁用' : '启用'}>
                    <Button
                      size="small"
                      color={teacher.isActive ? 'warning' : 'success'}
                      onClick={() => handleToggleActive(teacher)}
                    >
                      {teacher.isActive ? '禁用' : '启用'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="编辑">
                    <IconButton size="small" onClick={() => handleOpenEdit(teacher)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteConfirm({ open: true, teacher })}
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
        <DialogTitle>{editTeacher ? '编辑教师' : '新增教师'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required size="small" fullWidth />
            <TextField label="职称" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} size="small" fullWidth placeholder="如：教授、副教授" />
            <TextField label="学科" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} size="small" fullWidth />
            <TextField label="教龄(年)" type="number" value={form.years} onChange={(e) => setForm({ ...form, years: parseInt(e.target.value, 10) || 0 })} size="small" fullWidth />
            <TextField label="照片地址" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} size="small" fullWidth placeholder="可选，照片URL" />
            <TextField label="简介" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} size="small" fullWidth multiline rows={3} />
            <TextField label="排序" type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value, 10) || 0 })} size="small" fullWidth />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="启用" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>{editTeacher ? '保存' : '创建'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="确认删除"
        message={`确定要删除教师「${deleteConfirm.teacher?.name}」吗？`}
        confirmColor="error"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, teacher: null })}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity as AlertColor} onClose={toast.handleClose} />
    </Box>
  );
};

export default TeachersPage;
