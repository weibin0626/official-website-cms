import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import * as portalApi from '../../api/portal';
import { PORTAL_MAX_WIDTH } from '../../utils/constants';

/** Breadcrumb */
const Breadcrumb: React.FC<{ items: Array<{ label: string; to?: string }> }> = ({ items }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 2, fontSize: 14, color: '#666', flexWrap: 'wrap' }}>
    <HomeIcon sx={{ fontSize: 16 }} />
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        <ChevronRightIcon sx={{ fontSize: 14, mx: 0.3 }} />
        {item.to ? (
          <Link to={item.to} style={{ color: '#666', textDecoration: 'none' }}>{item.label}</Link>
        ) : (
          <span style={{ color: '#1a3a6b', fontWeight: 500 }}>{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </Box>
);

/** Leader list page */
const LeaderListPage: React.FC = () => {
  const [leaders, setLeaders] = useState<Array<{
    id: string;
    name: string;
    position: string;
    photo: string | null;
    bio: string | null;
    sort: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaders = async () => {
      try {
        // No siteId param: backend resolves site via X-Site-Host header
        const result = await portalApi.getLeaders();
        setLeaders(result);
      } catch (err) {
        console.error('Failed to load leaders:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLeaders();
  }, []);

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '60vh' }}>
      {/* Page header */}
      <Box sx={{ bgcolor: '#1a3a6b', color: '#fff', py: 3 }}>
        <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>领导班子</Typography>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 2 }}>
        <Breadcrumb items={[{ label: '首页', to: '/' }, { label: '领导班子' }]} />

        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : leaders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#999' }}>
            <Typography>暂无领导信息</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {leaders.map((leader) => (
              <Grid item xs={12} sm={6} md={3} key={leader.id}>
                <Box
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
                  }}
                >
                  <Box
                    component="img"
                    src={leader.photo || 'https://via.placeholder.com/300x360?text=Leader'}
                    alt={leader.name}
                    sx={{ width: '100%', height: 240, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1a3a6b', mb: 0.5 }}>
                      {leader.name}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#666', mb: 1 }}>
                      {leader.position}
                    </Typography>
                    {leader.bio && (
                      <Typography sx={{ fontSize: 13, color: '#999', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {leader.bio}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default LeaderListPage;
