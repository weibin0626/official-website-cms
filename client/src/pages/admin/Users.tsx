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
import LockResetIcon from '@mui/icons-material/LockReset';
import DataTable, { Column } from '../../components/Common/DataTable';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import Toast, { useToast } from '../../components/Common/Toast';
import { usePermission } from '../../hooks/usePermission';
import * as usersApi from '../../api/users';
import type { User, PaginatedResult } from '../../api/users';

const UsersPage: React.FC = () => {
  const { hasPermission, isSuperAdmin } = usePermission();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [resetConfirm, setResetConfirm] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const toast = useToast();

  // Form state
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    realName: '',
    isActive: true,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data: PaginatedResult<User> = await usersApi.listUsers({ page, pageSize, search });
      setUsers(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.showToast(error.message || '获取用户列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditUser(null);
    setForm({
      username: '',
      password: '',
      email: '',
      phone: '',
      realName: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setForm({
      username: user.username,
      password: '',
      email: user.email || '',
      phone: user.phone || '',
      realName: user.realName || '',
      isActive: user.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editUser) {
        await usersApi.updateUser(editUser.id, {
          email: form.email || undefined,
          phone: form.phone || undefined,
          realName: form.realName || undefined,
          isActive: form.isActive,
        });
        toast.showToast('用户更新成功', 'success');
      } else {
        await usersApi.createUser({
          username: form.username,
          password: form.password,
          email: form.email || undefined,
          phone: form.phone || undefined,
          realName: form.realName || undefined,
          isActive: form.isActive,
        });
        toast.showToast('用户创建成功', 'success');
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.user) return;
    try {
      await usersApi.deleteUser(deleteConfirm.user.id);
      toast.showToast('用户删除成功', 'success');
      fetchUsers();
    } catch (error: any) {
      toast.showToast(error.message || '删除失败', 'error');
    }
    setDeleteConfirm({ open: false, user: null });
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersApi.updateUserStatus(user.id, !user.isActive);
      toast.showToast(user.isActive ? '用户已禁用' : '用户已启用', 'success');
      fetchUsers();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!resetConfirm.user) return;
    try {
      const result = await usersApi.resetPassword(resetConfirm.user.id);
      toast.showToast(result.message || '密码重置成功', 'success');
    } catch (error: any) {
      toast.showToast(error.message || '重置失败', 'error');
    }
    setResetConfirm({ open: false, user: null });
  };

  const columns: Column<User>[] = [
    { id: 'username', label: '用户名', width: 120 },
    { id: 'realName', label: '姓名', width: 120 },
    { id: 'email', label: '邮箱', width: 200 },
    { id: 'phone', label: '电话', width: 140 },
    { id: 'isActive', label: '状态', width: 80, render: (row) => (
      <Chip
        label={row.isActive ? '启用' : '禁用'}
        size="small"
        color={row.isActive ? 'success' : 'default'}
        variant="outlined"
      />
    )},
    { id: 'actions', label: '操作', width: 280, align: 'left', render: (row) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(row)}>
          编辑
        </Button>
        <Button
          size="small"
          color={row.isActive ? 'warning' : 'success'}
          onClick={() => handleToggleActive(row)}
        >
          {row.isActive ? '禁用' : '启用'}
        </Button>
        <Button
          size="small"
          color="secondary"
          startIcon={<LockResetIcon />}
          onClick={() => setResetConfirm({ open: true, user: row })}
        >
          重置密码
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteConfirm({ open: true, user: row })}
        >
          删除
        </Button>
      </Box>
    )},
  ];

  if (!hasPermission('user', 'read') && !isSuperAdmin) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">暂无权限访问</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>用户管理</Typography>
        {(hasPermission('user', 'create') || isSuperAdmin) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            新增用户
          </Button>
        )}
      </Box>

      <DataTable
        columns={columns}
        rows={users}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        searchPlaceholder="搜索用户名/姓名/邮箱..."
        onSearch={(val) => { setSearch(val); setPage(1); }}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        getRowId={(row) => row.id}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editUser ? '编辑用户' : '新增用户'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="用户名"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              disabled={!!editUser}
              size="small"
            />
            {!editUser && (
              <TextField
                label="密码"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                size="small"
                helperText="最少6个字符"
              />
            )}
            <TextField
              label="姓名"
              value={form.realName}
              onChange={(e) => setForm({ ...form, realName: e.target.value })}
              size="small"
            />
            <TextField
              label="邮箱"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              size="small"
            />
            <TextField
              label="电话"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              size="small"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label="启用账号"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={editUser ? false : !form.username || !form.password}
          >
            {editUser ? '保存' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="确认删除"
        message={`确定要删除用户「${deleteConfirm.user?.realName || deleteConfirm.user?.username}」吗？此操作不可恢复。`}
        confirmColor="error"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, user: null })}
      />

      {/* Reset Password Confirm */}
      <ConfirmDialog
        open={resetConfirm.open}
        title="确认重置密码"
        message={`确定要重置用户「${resetConfirm.user?.realName || resetConfirm.user?.username}」的密码吗？密码将重置为默认密码 123456。`}
        confirmColor="warning"
        confirmText="重置"
        onConfirm={handleResetPassword}
        onCancel={() => setResetConfirm({ open: false, user: null })}
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

export default UsersPage;
