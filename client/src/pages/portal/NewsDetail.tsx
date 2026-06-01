import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Chip, Skeleton, Divider } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import * as portalApi from '../../api/portal';
import type { PortalArticleDetail } from '../../api/portal';
import { formatDate } from '../../utils/formatters';
import { PORTAL_MAX_WIDTH } from '../../utils/constants';

/** Breadcrumb */
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

/** Article detail page */
const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<PortalArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadArticle = async () => {
      try {
        const result = await portalApi.getArticleDetail(id);
        setArticle(result);
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
    // Scroll to top on new article
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 4 }}>
        <Skeleton width="60%" height={36} sx={{ mb: 2 }} />
        <Skeleton width="30%" height={20} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">文章不存在或未发布</Typography>
        <Box component={Link} to="/news" sx={{ color: '#1a3a6b', mt: 2, display: 'inline-block', textDecoration: 'none' }}>
          返回新闻列表
        </Box>
      </Container>
    );
  }

  const breadcrumbItems = [
    { label: '首页', to: '/' },
    ...(article.node ? [{ label: article.node.name, to: `/news?nodeId=${article.node.id}` }] : []),
    { label: article.title },
  ];

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '60vh' }}>
      <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 2 }}>
        <Breadcrumb items={breadcrumbItems} />

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: { xs: 2, sm: 4 }, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {/* Title */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1a3a6b',
                  mb: 2,
                  fontSize: { xs: 22, md: 28 },
                  lineHeight: 1.4,
                }}
              >
                {article.title}
              </Typography>

              {/* Meta info */}
              <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', color: '#999', fontSize: 13 }}>
                {article.publishedAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                    {formatDate(article.publishedAt)}
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VisibilityIcon sx={{ fontSize: 16 }} />
                  {article.viewCount} 次浏览
                </Box>
                {article.author?.realName && (
                  <Box>来源：{article.author.realName}</Box>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Article content */}
              <Box
                sx={{
                  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, my: 1 },
                  '& p': { mb: 1.5, lineHeight: 1.8, fontSize: 16, color: '#333' },
                  '& h1, & h2, & h3, & h4': { color: '#1a3a6b', mt: 2, mb: 1 },
                  '& a': { color: '#1a3a6b' },
                  '& table': { borderCollapse: 'collapse', width: '100%', my: 2 },
                  '& td, & th': { border: '1px solid #ddd', p: 1 },
                  '& blockquote': { borderLeft: '4px solid #1a3a6b', pl: 2, ml: 0, color: '#666' },
                  '& ul, & ol': { pl: 3 },
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: '#333',
                  wordBreak: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Prev/Next navigation */}
              <Divider sx={{ mt: 4, mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: 14 }}>
                {article.navigation.prev && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowBackIcon sx={{ fontSize: 16, color: '#1a3a6b' }} />
                    <span style={{ color: '#666', flexShrink: 0 }}>上一篇：</span>
                    <Link to={`/news/${article.navigation.prev.id}`} style={{ color: '#1a3a6b', textDecoration: 'none' }}>
                      {article.navigation.prev.title}
                    </Link>
                  </Box>
                )}
                {article.navigation.next && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: '#1a3a6b' }} />
                    <span style={{ color: '#666', flexShrink: 0 }}>下一篇：</span>
                    <Link to={`/news/${article.navigation.next.id}`} style={{ color: '#1a3a6b', textDecoration: 'none' }}>
                      {article.navigation.next.title}
                    </Link>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Sidebar - related articles */}
          {article.related && article.related.length > 0 && (
            <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
              <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: 80 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#1a3a6b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 3, height: 18, bgcolor: '#1a3a6b', borderRadius: 2 }} />
                  相关推荐
                </Typography>
                {article.related.map((rel) => (
                  <Box
                    key={rel.id}
                    component={Link}
                    to={`/news/${rel.id}`}
                    sx={{
                      py: 1.2,
                      borderBottom: '1px solid #f0f0f0',
                      textDecoration: 'none',
                      color: '#333',
                      fontSize: 14,
                      lineHeight: 1.5,
                      '&:hover': { color: '#1a3a6b' },
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {rel.title}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default NewsDetailPage;
