import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PublishIcon from '@mui/icons-material/Publish';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import DataTable, { Column } from '../../components/Common/DataTable';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import * as articlesApi from '../../api/articles';
import type { Article } from '../../api/articles';
import * as nodesApi from '../../api/nodes';
import type { NodeItem } from '../../api/nodes';
import { useSite } from '../../hooks/useSite';
import { useNavigate } from 'react-router-dom';

/** Article status label and color mapping */
const STATUS_MAP: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' }> = {
  DRAFT: { label: '草稿', color: 'default' },
  PENDING: { label: '待审核', color: 'warning' },
  PUBLISHED: { label: '已发布', color: 'success' },
  REJECTED: { label: '已退稿', color: 'error' },
  OFFLINE: { label: '已下线', color: 'info' },
  TRASHED: { label: '已删除', color: 'error' },
};

const ArticlesPage: React.FC = () => {
  const { currentSiteId } = useSite();
  const navigate = useNavigate();

  // Article list state
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [nodeFilter, setNodeFilter] = useState('');
  const [keyword, setKeyword] = useState('');

  // Node list for filter dropdown
  const [nodes, setNodes] = useState<{ id: string; name: string }[]>([]);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  /** Flatten the node tree into a list for the dropdown */
  const flattenNodes = useCallback((items: NodeItem[], result: { id: string; name: string }[] = []) => {
    for (const item of items) {
      result.push({ id: item.id, name: item.name });
      if (item.children) {
        flattenNodes(item.children, result);
      }
    }
    return result;
  }, []);

  /** Fetch articles */
  const fetchArticles = useCallback(async () => {
    if (!currentSiteId) return;
    setLoading(true);
    try {
      const result = await articlesApi.listArticles({
        page,
        pageSize,
        status: statusFilter || undefined,
        nodeId: nodeFilter || undefined,
        keyword: keyword || undefined,
      });
      setArticles(result.list);
      setTotal(result.total);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '获取文章列表失败', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentSiteId, page, pageSize, statusFilter, nodeFilter, keyword]);

  /** Fetch nodes for the filter */
  const fetchNodes = useCallback(async () => {
    if (!currentSiteId) return;
    try {
      const data = await nodesApi.listNodes();
      setNodes(flattenNodes(data));
    } catch {
      // Silently fail — filter is optional
    }
  }, [currentSiteId, flattenNodes]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  /** Status action handlers */
  const handleSubmit = useCallback((article: Article) => {
    setConfirmDialog({
      open: true,
      title: '提交审核',
      message: `确定要提交文章「${article.title}」进行审核吗？`,
      onConfirm: async () => {
        try {
          await articlesApi.submitArticle(article.id);
          setSnackbar({ open: true, message: '提交审核成功', severity: 'success' });
          fetchArticles();
        } catch (err: any) {
          setSnackbar({ open: true, message: err.message || '操作失败', severity: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  }, [confirmDialog, fetchArticles]);

  const handleApprove = useCallback((article: Article) => {
    setConfirmDialog({
      open: true,
      title: '审核通过',
      message: `确定要审核通过文章「${article.title}」吗？`,
      onConfirm: async () => {
        try {
          await articlesApi.auditArticle(article.id, { action: 'approve' });
          setSnackbar({ open: true, message: '审核通过', severity: 'success' });
          fetchArticles();
        } catch (err: any) {
          setSnackbar({ open: true, message: err.message || '操作失败', severity: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  }, [confirmDialog, fetchArticles]);

  const handleReject = useCallback((article: Article) => {
    setConfirmDialog({
      open: true,
      title: '退稿',
      message: `确定要退回文章「${article.title}」吗？`,
      onConfirm: async () => {
        try {
          await articlesApi.auditArticle(article.id, { action: 'reject' });
          setSnackbar({ open: true, message: '已退稿', severity: 'success' });
          fetchArticles();
        } catch (err: any) {
          setSnackbar({ open: true, message: err.message || '操作失败', severity: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  }, [confirmDialog, fetchArticles]);

  const handlePublish = useCallback((article: Article) => {
    setConfirmDialog({
      open: true,
      title: '直接发布',
      message: `确定要直接发布文章「${article.title}」吗？`,
      onConfirm: async () => {
        try {
          await articlesApi.publishArticle(article.id);
          setSnackbar({ open: true, message: '发布成功', severity: 'success' });
          fetchArticles();
        } catch (err: any) {
          setSnackbar({ open: true, message: err.message || '操作失败', severity: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  }, [confirmDialog, fetchArticles]);

  const handleOffline = useCallback((article: Article) => {
    setConfirmDialog({
      open: true,
      title: '下线',
      message: `确定要下线文章「${article.title}」吗？`,
      onConfirm: async () => {
        try {
          await articlesApi.offlineArticle(article.id);
          setSnackbar({ open: true, message: '下线成功', severity: 'success' });
          fetchArticles();
        } catch (err: any) {
          setSnackbar({ open: true, message: err.message || '操作失败', severity: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  }, [confirmDialog, fetchArticles]);

  const handleDelete = useCallback((article: Article) => {
    setConfirmDialog({
      open: true,
      title: '删除文章',
      message: `确定要删除文章「${article.title}」吗？文章将被移入回收站。`,
      onConfirm: async () => {
        try {
          await articlesApi.deleteArticle(article.id);
          setSnackbar({ open: true, message: '删除成功', severity: 'success' });
          fetchArticles();
        } catch (err: any) {
          setSnackbar({ open: true, message: err.message || '删除失败', severity: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  }, [confirmDialog, fetchArticles]);

  /** Render status action buttons based on article status */
  const renderStatusActions = (article: Article) => {
    const actions: React.ReactNode[] = [];
    const status = article.status;

    if (status === 'DRAFT') {
      actions.push(
        <Tooltip title="提交审核" key="submit">
          <IconButton size="small" color="warning" onClick={() => handleSubmit(article)}>
            <SendIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
      );
      actions.push(
        <Tooltip title="直接发布" key="publish">
          <IconButton size="small" color="success" onClick={() => handlePublish(article)}>
            <PublishIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
      );
    }
    if (status === 'PENDING') {
      actions.push(
        <Tooltip title="审核通过" key="approve">
          <IconButton size="small" color="success" onClick={() => handleApprove(article)}>
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
      );
      actions.push(
        <Tooltip title="退稿" key="reject">
          <IconButton size="small" color="error" onClick={() => handleReject(article)}>
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
      );
    }
    if (status === 'PUBLISHED') {
      actions.push(
        <Tooltip title="下线" key="offline">
          <IconButton size="small" color="info" onClick={() => handleOffline(article)}>
            <CloudOffIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
      );
    }
    if (status === 'REJECTED') {
      actions.push(
        <Tooltip title="编辑" key="edit">
          <IconButton size="small" color="primary" onClick={() => navigate(`/admin/articles/edit/${article.id}`)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
      );
    }

    return <Box sx={{ display: 'flex', gap: 0.5 }}>{actions}</Box>;
  };

  // Table columns
  const columns: Column<Article>[] = [
    {
      id: 'title',
      label: '标题',
      minWidth: 200,
      render: (row) => (
        <Typography
          variant="body2"
          sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
          onClick={() => navigate(`/admin/articles/edit/${row.id}`)}
        >
          {row.title}
        </Typography>
      ),
    },
    {
      id: 'node',
      label: '栏目',
      minWidth: 120,
      render: (row) => row.node?.name || '-',
    },
    {
      id: 'status',
      label: '状态',
      minWidth: 100,
      render: (row) => {
        const s = STATUS_MAP[row.status] || { label: row.status, color: 'default' as const };
        return <Chip label={s.label} color={s.color} size="small" variant="outlined" />;
      },
    },
    {
      id: 'author',
      label: '作者',
      minWidth: 100,
      render: (row) => row.author?.realName || row.author?.username || '-',
    },
    {
      id: 'viewCount',
      label: '浏览量',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'createdAt',
      label: '创建时间',
      minWidth: 160,
      render: (row) => new Date(row.createdAt).toLocaleString('zh-CN'),
    },
    {
      id: 'actions',
      label: '操作',
      minWidth: 180,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title="编辑">
            <IconButton size="small" onClick={() => navigate(`/admin/articles/edit/${row.id}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除">
            <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {renderStatusActions(row)}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          文章管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/articles/edit/new')}
        >
          新建文章
        </Button>
      </Box>

      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>状态</InputLabel>
          <Select
            value={statusFilter}
            label="状态"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="DRAFT">草稿</MenuItem>
            <MenuItem value="PENDING">待审核</MenuItem>
            <MenuItem value="PUBLISHED">已发布</MenuItem>
            <MenuItem value="REJECTED">已退稿</MenuItem>
            <MenuItem value="OFFLINE">已下线</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>栏目</InputLabel>
          <Select
            value={nodeFilter}
            label="栏目"
            onChange={(e) => {
              setNodeFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">全部栏目</MenuItem>
            {nodes.map((n) => (
              <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder="搜索标题..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 200 }}
        />
      </Box>

      {/* Data table */}
      <DataTable<Article>
        columns={columns}
        rows={articles}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        searchable={false}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        getRowId={(row) => row.id}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ArticlesPage;
