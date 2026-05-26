import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import PublishIcon from '@mui/icons-material/Publish';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../../components/Editor/RichTextEditor';
import * as articlesApi from '../../api/articles';
import type { Article } from '../../api/articles';
import * as nodesApi from '../../api/nodes';
import type { NodeItem } from '../../api/nodes';
import { useSite } from '../../hooks/useSite';

/** Flatten the node tree into a list for the dropdown */
const flattenNodes = (items: NodeItem[], prefix: string = ''): { id: string; name: string; depth: number }[] => {
  const result: { id: string; name: string; depth: number }[] = [];
  for (const item of items) {
    result.push({ id: item.id, name: `${prefix}${item.name}`, depth: prefix.length });
    if (item.children && item.children.length > 0) {
      result.push(...flattenNodes(item.children, prefix + '　'));
    }
  }
  return result;
};

const ArticleEditPage: React.FC = () => {
  const { currentSiteId } = useSite();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  // Form state
  const [title, setTitle] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [articleStatus, setArticleStatus] = useState('DRAFT');

  // Node list for dropdown
  const [flatNodes, setFlatNodes] = useState<{ id: string; name: string; depth: number }[]>([]);

  // Original article (for editing)
  const [originalArticle, setOriginalArticle] = useState<Article | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [saving, setSaving] = useState(false);

  /** Fetch the article for editing */
  const fetchArticle = useCallback(async () => {
    if (isNew || !id) return;
    try {
      const article = await articlesApi.getArticle(id);
      setOriginalArticle(article);
      setTitle(article.title);
      setNodeId(article.nodeId || '');
      setSummary(article.summary || '');
      setCoverImage(article.coverImage || '');
      setContent(article.content);
      setArticleStatus(article.status);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '获取文章失败', severity: 'error' });
    }
  }, [id, isNew]);

  /** Fetch node list for the dropdown */
  const fetchNodes = useCallback(async () => {
    if (!currentSiteId) return;
    try {
      const data = await nodesApi.listNodes();
      setFlatNodes(flattenNodes(data));
    } catch {
      // Silently fail
    }
  }, [currentSiteId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  /** Save as draft */
  const handleSaveDraft = useCallback(async () => {
    if (!title.trim()) {
      setSnackbar({ open: true, message: '标题不能为空', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const result = await articlesApi.createArticle({
          title,
          content,
          summary: summary || undefined,
          coverImage: coverImage || undefined,
          nodeId: nodeId || undefined,
          status: 'DRAFT',
        });
        navigate(`/admin/articles/edit/${result.id}`, { replace: true });
        setSnackbar({ open: true, message: '草稿已保存', severity: 'success' });
      } else if (id) {
        await articlesApi.updateArticle(id, {
          title,
          content,
          summary: summary || undefined,
          coverImage: coverImage || undefined,
          nodeId: nodeId || undefined,
        });
        setSnackbar({ open: true, message: '草稿已保存', severity: 'success' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '保存失败', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, [isNew, id, title, content, summary, coverImage, nodeId, navigate]);

  /** Submit for review */
  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setSnackbar({ open: true, message: '标题不能为空', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const result = await articlesApi.createArticle({
          title,
          content,
          summary: summary || undefined,
          coverImage: coverImage || undefined,
          nodeId: nodeId || undefined,
          status: 'DRAFT',
        });
        await articlesApi.submitArticle(result.id);
        navigate(`/admin/articles/edit/${result.id}`, { replace: true });
        setSnackbar({ open: true, message: '已提交审核', severity: 'success' });
      } else if (id) {
        await articlesApi.updateArticle(id, {
          title,
          content,
          summary: summary || undefined,
          coverImage: coverImage || undefined,
          nodeId: nodeId || undefined,
        });
        await articlesApi.submitArticle(id);
        setArticleStatus('PENDING');
        setSnackbar({ open: true, message: '已提交审核', severity: 'success' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '提交失败', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, [isNew, id, title, content, summary, coverImage, nodeId, navigate]);

  /** Direct publish */
  const handlePublish = useCallback(async () => {
    if (!title.trim()) {
      setSnackbar({ open: true, message: '标题不能为空', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const result = await articlesApi.createArticle({
          title,
          content,
          summary: summary || undefined,
          coverImage: coverImage || undefined,
          nodeId: nodeId || undefined,
          status: 'DRAFT',
        });
        await articlesApi.publishArticle(result.id);
        navigate(`/admin/articles/edit/${result.id}`, { replace: true });
        setSnackbar({ open: true, message: '已发布', severity: 'success' });
      } else if (id) {
        await articlesApi.updateArticle(id, {
          title,
          content,
          summary: summary || undefined,
          coverImage: coverImage || undefined,
          nodeId: nodeId || undefined,
        });
        await articlesApi.publishArticle(id);
        setArticleStatus('PUBLISHED');
        setSnackbar({ open: true, message: '已发布', severity: 'success' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '发布失败', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, [isNew, id, title, content, summary, coverImage, nodeId, navigate]);

  const canSubmit = articleStatus === 'DRAFT' || articleStatus === 'REJECTED';
  const canPublish = articleStatus === 'DRAFT' || articleStatus === 'OFFLINE';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/articles')}>
          返回列表
        </Button>
        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
          {isNew ? '新建文章' : '编辑文章'}
        </Typography>
        {!isNew && (
          <Typography variant="body2" color="text.secondary">
            当前状态：{articleStatus}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Main content area */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <TextField
              label="文章标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              size="small"
              sx={{ mb: 2 }}
            />
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>所属栏目</InputLabel>
              <Select value={nodeId} label="所属栏目" onChange={(e) => setNodeId(e.target.value)}>
                <MenuItem value="">无栏目</MenuItem>
                {flatNodes.map((n) => (
                  <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="摘要"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              label="封面图URL"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              fullWidth
              size="small"
              placeholder="从文件库选择或输入URL"
              sx={{ mb: 2 }}
            />
            <TextField
              label="来源"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />
          </Paper>

          {/* Rich text editor */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              文章内容
            </Typography>
            <RichTextEditor value={content} onChange={setContent} height={500} />
          </Paper>
        </Box>

        {/* Right sidebar with action buttons */}
        <Box sx={{ width: 200, flexShrink: 0 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              操作
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveDraft}
                disabled={saving}
                fullWidth
              >
                保存草稿
              </Button>
              {canSubmit && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<SendIcon />}
                  onClick={handleSubmit}
                  disabled={saving}
                  fullWidth
                >
                  提交审核
                </Button>
              )}
              {canPublish && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PublishIcon />}
                  onClick={handlePublish}
                  disabled={saving}
                  fullWidth
                >
                  直接发布
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

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

export default ArticleEditPage;
