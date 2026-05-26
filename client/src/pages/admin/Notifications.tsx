import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  AlertColor,
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DataTable, { Column } from '../../components/Common/DataTable';
import Toast, { useToast } from '../../components/Common/Toast';
import * as notificationsApi from '../../api/notifications';
import type { Notification } from '../../api/notifications';
import type { PaginatedResult } from '../../api/users';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const toast = useToast();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data: PaginatedResult<Notification> = await notificationsApi.listNotifications({ page, pageSize });
      setNotifications(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.showToast(error.message || '获取通知列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationsApi.getUnreadCount();
      setUnreadCount(result.count);
    } catch {
      // Silent fail for count
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      toast.showToast('已标记为已读', 'success');
      fetchNotifications();
      fetchUnreadCount();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationsApi.markAllAsRead();
      toast.showToast(`已标记 ${result.count} 条通知为已读`, 'success');
      fetchNotifications();
      fetchUnreadCount();
    } catch (error: any) {
      toast.showToast(error.message || '操作失败', 'error');
    }
  };

  const columns: Column<Notification>[] = [
    {
      id: 'isRead',
      label: '状态',
      width: 80,
      render: (row) => (
        <Chip
          label={row.isRead ? '已读' : '未读'}
          size="small"
          color={row.isRead ? 'default' : 'primary'}
          variant={row.isRead ? 'outlined' : 'filled'}
        />
      ),
    },
    {
      id: 'title',
      label: '标题',
      width: 200,
      render: (row) => (
        <Typography variant="body2" fontWeight={row.isRead ? 400 : 600}>
          {row.title}
        </Typography>
      ),
    },
    {
      id: 'content',
      label: '内容',
      width: 400,
      render: (row) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 380 }}>
          {row.content}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: '类型',
      width: 100,
      render: (row) => row.type,
    },
    {
      id: 'createdAt',
      label: '时间',
      width: 170,
      render: (row) => new Date(row.createdAt).toLocaleString('zh-CN'),
    },
    {
      id: 'actions',
      label: '操作',
      width: 100,
      render: (row) => !row.isRead ? (
        <Button size="small" onClick={() => handleMarkAsRead(row.id)}>标记已读</Button>
      ) : null,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" fontWeight={600}>通知管理</Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} 条未读`} color="primary" size="small" />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button variant="outlined" startIcon={<DoneAllIcon />} onClick={handleMarkAllAsRead}>
            全部标记已读
          </Button>
        )}
      </Box>

      <DataTable
        columns={columns}
        rows={notifications}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        searchable={false}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        getRowId={(row) => row.id}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity as AlertColor} onClose={toast.handleClose} />
    </Box>
  );
};

export default NotificationsPage;
