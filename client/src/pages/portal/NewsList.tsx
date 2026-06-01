import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Grid, Typography, Pagination, TextField, InputAdornment, Skeleton } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import * as portalApi from '../../api/portal';
import type { PaginatedArticles, PortalArticle } from '../../api/portal';
import { formatDate, truncateText, stripHtml } from '../../utils/formatters';
import { PORTAL_MAX_WIDTH, PORTAL_PAGE_SIZE } from '../../utils/constants';

/** Breadcrumb component */
const Breadcrumb: React.FC<{ items: Array<{ label: string; to?: string }> }> = ({ items }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 2, fontSize: 14, color: '#666', flexWrap: 'wrap' }}>
    <HomeIcon sx={{ fontSize: 16 }} />
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        <ChevronRightIcon sx={{ fontSize: 14, mx: 0.3 }} />
        {item.to ? (
          <Link to={item.to} style={{ color: '#666', textDecoration: 'none' }}>
            {item.label}
          </Link>
        ) : (
          <span style={{ color: '#1a3a6b', fontWeight: 500 }}>{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </Box>
);

/** Article list item */
const ArticleListItem: React.FC<{ article: PortalArticle }> = ({ article }) => (
  <Box
    component={Link}
    to={`/news/${article.id}`}
    sx={{
      display: 'flex',
      gap: 2.5,
      py: 2,
      borderBottom: '1px solid #f0f0f0',
      textDecoration: 'none',
      color: 'inherit',
      '&:hover': { bgcolor: '#fafbfc' },
      px: 1,
      borderRadius: 1,
      transition: 'background 0.15s',
    }}
  >
    {/* Cover image */}
    {article.coverImage && (
      <Box
        component="img"
        src={article.coverImage}
        alt={article.title}
        sx={{ width: { xs: 100, sm: 180 }, height: { xs: 75, sm: 120 }, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
      />
    )}
    {/* Content */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: { xs: 15, sm: 17 },
          fontWeight: 600,
          color: '#333',
          mb: 0.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.5,
        }}
      >
        {article.title}
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          color: '#888',
          mb: 0.5,
          display: { xs: 'none', sm: '-webkit-box' },
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {truncateText(stripHtml(article.content), 120)}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, fontSize: 12, color: '#aaa', mt: 'auto' }}>
        {article.node?.name && <span>{article.node.name}</span>}
        {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
        <span>浏览 {article.viewCount}</span>
      </Box>
    </Box>
  </Box>
);

/** News list page */
const NewsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const nodeId = searchParams.get('nodeId') || undefined;
  const keyword = searchParams.get('keyword') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [articles, setArticles] = useState<PaginatedArticles | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(keyword || '');
  const [nodeName, setNodeName] = useState<string>('新闻中心');

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
        // No siteId param: backend resolves site via X-Site-Host header
        const result = await portalApi.getArticleList({
          page,
          pageSize: PORTAL_PAGE_SIZE,
          nodeId,
          keyword,
        });
      setArticles(result);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  }, [page, nodeId, keyword]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Load node name if nodeId provided
  useEffect(() => {
    if (nodeId) {
      portalApi.getNodeDetail(nodeId).then((node) => {
        if (node) setNodeName(node.name);
      }).catch(() => {});
    } else {
      setNodeName(keyword ? `搜索：${keyword}` : '新闻中心');
    }
  }, [nodeId, keyword]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchText.trim()) {
      params.set('keyword', searchText.trim());
    }
    setSearchParams(params);
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '60vh' }}>
      {/* Page header */}
      <Box sx={{ bgcolor: '#1a3a6b', color: '#fff', py: 3 }}>
        <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {nodeName}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 2 }}>
        <Breadcrumb items={[{ label: '首页', to: '/' }, { label: nodeName }]} />

        {/* Search bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: 'flex', gap: 1, mb: 3 }}
        >
          <TextField
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索文章..."
            sx={{ flex: 1, maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#999' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Article list */}
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: { xs: 1.5, sm: 3 }, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, py: 2 }}>
                <Skeleton variant="rectangular" width={180} height={120} sx={{ borderRadius: 1 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={24} />
                  <Skeleton width="100%" height={16} sx={{ mt: 1 }} />
                  <Skeleton width="40%" height={14} sx={{ mt: 1 }} />
                </Box>
              </Box>
            ))
          ) : articles && articles.list.length > 0 ? (
            articles.list.map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 6, color: '#999' }}>
              <Typography>暂无文章</Typography>
            </Box>
          )}
        </Box>

        {/* Pagination */}
        {articles && articles.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={articles.totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default NewsListPage;
