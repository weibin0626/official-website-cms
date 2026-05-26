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
  Chip,
  AlertColor,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import DataTable, { Column } from '../../components/Common/DataTable';
import Toast, { useToast } from '../../components/Common/Toast';
import * as auditlogsApi from '../../api/auditlogs';
import type { AuditLog, AuditLogListParams } from '../../api/auditlogs';

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const toast = useToast();

  // Filter state
  const [filterAction, setFilterAction] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: AuditLogListParams = {
        page,
        pageSize,
      };
      if (filterAction) params.action = filterAction;
      if (filterUserId) params.userId = filterUserId;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const data = await auditlogsApi.listAuditLogs(params);
      setLogs(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.showToast(error.message || '获取日志列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterAction, filterUserId, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const columns: Column<AuditLog>[] = [
    {
      id: 'createdAt',
      label: '时间',
      width: 170,
      render: (row) => new Date(row.createdAt).toLocaleString('zh-CN'),
    },
    {
      id: 'user',
      label: '用户',
      width: 120,
      render: (row) => row.user?.realName || row.user?.username || row.userId || '-',
    },
    { id: 'action', label: '操作', width: 140 },
    { id: 'resource', label: '资源', width: 120 },
    { id: 'resourceId', label: '资源ID', width: 120, render: (row) => row.resourceId ? row.resourceId.substring(0, 8) + '...' : '-' },
    {
      id: 'ipAddress',
      label: 'IP',
      width: 130,
      render: (row) => row.ipAddress || '-',
    },
    {
      id: 'actions',
      label: '操作',
      width: 80,
      render: (row) => (
        <Button size="small" onClick={() => handleViewDetail(row)}>详情</Button>
      ),
    },
  ];

  const actionTypes = ['CREATE', 'UPDATE', 'DELETE', 'SORT', 'RESTORE', 'PERMANENT_DELETE', 'UPDATE_STATUS', 'RESET_PASSWORD', 'LOGIN'];

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>操作日志</Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>操作类型</InputLabel>
          <Select value={filterAction} label="操作类型" onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}>
            <MenuItem value="">全部</MenuItem>
            {actionTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="用户ID"
          value={filterUserId}
          onChange={(e) => { setFilterUserId(e.target.value); setPage(1); }}
          size="small"
          sx={{ width: 200 }}
        />
        <TextField
          label="开始日期"
          type="date"
          value={filterStartDate}
          onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
        />
        <TextField
          label="结束日期"
          type="date"
          value={filterEndDate}
          onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
        />
        <Button variant="outlined" size="small" onClick={() => { setFilterAction(''); setFilterUserId(''); setFilterStartDate(''); setFilterEndDate(''); setPage(1); }}>
          重置
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={logs}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        searchable={false}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        getRowId={(row) => row.id}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>日志详情</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              <Typography variant="body2"><strong>时间：</strong>{new Date(selectedLog.createdAt).toLocaleString('zh-CN')}</Typography>
              <Typography variant="body2"><strong>用户：</strong>{selectedLog.user?.realName || selectedLog.user?.username || '-'}</Typography>
              <Typography variant="body2"><strong>操作：</strong>{selectedLog.action}</Typography>
              <Typography variant="body2"><strong>资源：</strong>{selectedLog.resource}</Typography>
              <Typography variant="body2"><strong>资源ID：</strong>{selectedLog.resourceId || '-'}</Typography>
              <Typography variant="body2"><strong>IP地址：</strong>{selectedLog.ipAddress || '-'}</Typography>
              <Typography variant="body2"><strong>User-Agent：</strong>{selectedLog.userAgent || '-'}</Typography>
              {selectedLog.detail && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}><strong>详情：</strong></Typography>
                  <Box
                    component="pre"
                    sx={{
                      bgcolor: 'grey.100',
                      p: 1.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 300,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.detail), null, 2);
                      } catch {
                        return selectedLog.detail;
                      }
                    })()}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      <Toast open={toast.open} message={toast.message} severity={toast.severity as AlertColor} onClose={toast.handleClose} />
    </Box>
  );
};

export default AuditLogsPage;
