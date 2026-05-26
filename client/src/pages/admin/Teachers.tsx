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

  const columns: Column<Teacher>[] = [
    {
      id: 'photo',
      label: '照片',
      width: 80,
      render: (row) =>
        row.photo ? (
          <Box component="img" src={row.photo} alt={row.name} sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
        ) : (
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'grey.500' }}>
            {row.name.charAt(0)}
          </Box>
        ),
    },
    { id: 'name', label: '姓名', width: 120 },
    { id: 'title', label: '职称', width: 120, render: (row) => row.title || '-' },
    { id: 'subject', label: '学科', width: 120, render: (row) => row.subject || '-' },
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
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteConfirm({ open: true, teacher: row })}>删除</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>师资管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>新增教师</Button>
      </Box>

      <DataTable
        columns={columns}
        rows={teachers}
        total={teachers.length}
        page={1}
        pageSize={100}
        loading={loading}
        searchable={false}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        getRowId={(row) => row.id}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTeacher ? '编辑教师' : '新增教师'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required size="small" />
            <TextField label="职称" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} size="small" placeholder="如：教授、副教授" />
            <TextField label="学科" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} size="small" />
            <TextField label="教龄(年)" type="number" value={form.years} onChange={(e) => setForm({ ...form, years: parseInt(e.target.value, 10) || 0 })} size="small" />
            <TextField label="照片地址" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} size="small" placeholder="可选，照片URL" />
            <TextField label="简介" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} size="small" multiline rows={3} />
            <TextField label="排序" type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value, 10) || 0 })} size="small" />
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
