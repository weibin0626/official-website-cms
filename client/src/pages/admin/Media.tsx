import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import * as mediaApi from '../../api/media';
import type { MediaItem } from '../../api/media';
import { useSite } from '../../hooks/useSite';

/** Format file size for display */
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Get icon by media type */
const getMediaIcon = (type: string, mimeType: string): React.ReactElement => {
  if (type === 'IMAGE' || mimeType.startsWith('image/')) return <ImageIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
  if (type === 'VIDEO' || mimeType.startsWith('video/')) return <MovieIcon sx={{ fontSize: 48, color: 'secondary.main' }} />;
  if (mimeType === 'application/pdf') return <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
};

const MediaPage: React.FC = () => {
  const { currentSiteId } = useSite();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media list state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  // Filter
  const [typeFilter, setTypeFilter] = useState('');

  // Upload
  const [uploading, setUploading] = useState(false);

  // Preview dialog
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  /** Fetch media list */
  const fetchMedia = useCallback(async () => {
    if (!currentSiteId) return;
    setLoading(true);
    try {
      const result = await mediaApi.listMedia({
        page,
        pageSize,
        mimetype: typeFilter || undefined,
      });
      setMediaList(result.list);
      setTotal(result.total);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '获取文件列表失败', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentSiteId, page, pageSize, typeFilter]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  /** Handle file upload */
  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        await mediaApi.uploadMedia(formData);
      }
      setSnackbar({ open: true, message: `成功上传 ${files.length} 个文件`, severity: 'success' });
      fetchMedia();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '上传失败', severity: 'error' });
    } finally {
      setUploading(false);
    }
  }, [fetchMedia]);

  /** Handle file input change */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files);
    // Reset the input so the same file can be re-uploaded
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleUpload]);

  /** Handle drag-and-drop */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /** Preview a media item */
  const handlePreview = useCallback((item: MediaItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  }, []);

  /** Delete a media item */
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await mediaApi.deleteMedia(deleteTarget.id);
      setSnackbar({ open: true, message: '删除成功', severity: 'success' });
      fetchMedia();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || '删除失败', severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, fetchMedia]);

  /** Load more (simple pagination) */
  const hasMore = mediaList.length < total;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          文件管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '上传中...' : '上传文件'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          onChange={handleFileInputChange}
        />
      </Box>

      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>类型</InputLabel>
          <Select
            value={typeFilter}
            label="类型"
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="image/">图片</MenuItem>
            <MenuItem value="application/">文档</MenuItem>
            <MenuItem value="video/">视频</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Drop zone + grid */}
      <Paper
        variant="outlined"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          p: 2,
          minHeight: 400,
          borderStyle: 'dashed',
          borderColor: uploading ? 'primary.main' : 'divider',
          bgcolor: uploading ? 'primary.50' : 'background.paper',
          transition: 'all 0.2s',
        }}
      >
        {loading ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
            加载中...
          </Typography>
        ) : mediaList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CloudUploadIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              拖拽文件到此处上传，或点击上方按钮选择文件
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
            {mediaList.map((item) => (
              <Card
                key={item.id}
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                  transition: 'all 0.2s',
                }}
                onClick={() => handlePreview(item)}
              >
                {/* Thumbnail or icon */}
                {item.type === 'IMAGE' ? (
                  <CardMedia
                    component="img"
                    height={140}
                    image={item.url}
                    alt={item.originalName}
                    sx={{ objectFit: 'cover', bgcolor: 'grey.100' }}
                  />
                ) : (
                  <Box sx={{
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.50',
                  }}>
                    {getMediaIcon(item.type, item.mimeType)}
                  </Box>
                )}
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Typography variant="body2" noWrap title={item.originalName}>
                    {item.originalName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatSize(item.size)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ pt: 0, px: 1, pb: 0.5 }}>
                  <Chip
                    label={item.type}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <Box sx={{ flex: 1 }} />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(item);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        {/* Load more */}
        {hasMore && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button size="small" onClick={() => setPage((p) => p + 1)}>
              加载更多
            </Button>
          </Box>
        )}
      </Paper>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {previewItem?.originalName || '文件预览'}
          <IconButton onClick={() => setPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewItem && (
            <Box>
              {previewItem.type === 'IMAGE' ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={previewItem.url}
                    alt={previewItem.originalName}
                    style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain' }}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  {getMediaIcon(previewItem.type, previewItem.mimeType)}
                  <Typography sx={{ mt: 2 }}>
                    该文件类型不支持在线预览
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    href={previewItem.url}
                    target="_blank"
                    download
                  >
                    下载文件
                  </Button>
                </Box>
              )}
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2"><strong>文件名：</strong>{previewItem.originalName}</Typography>
                <Typography variant="body2"><strong>大小：</strong>{formatSize(previewItem.size)}</Typography>
                <Typography variant="body2"><strong>类型：</strong>{previewItem.mimeType}</Typography>
                <Typography variant="body2"><strong>上传时间：</strong>{new Date(previewItem.createdAt).toLocaleString('zh-CN')}</Typography>
                <TextField
                  label="文件URL"
                  value={previewItem.url}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mt: 1 }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="删除文件"
        message={`确定要删除文件「${deleteTarget?.originalName}」吗？此操作不可恢复。`}
        confirmText="删除"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
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

export default MediaPage;
