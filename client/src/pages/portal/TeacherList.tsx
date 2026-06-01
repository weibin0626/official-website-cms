import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Chip, Skeleton } from '@mui/material';
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

/** Teacher list page */
const TeacherListPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Array<{
    id: string;
    name: string;
    title: string | null;
    subject: string | null;
    years: number | null;
    photo: string | null;
    bio: string | null;
    sort: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        // No siteId param: backend resolves site via X-Site-Host header
        const result = await portalApi.getTeachers();
        setTeachers(result);
      } catch (err) {
        console.error('Failed to load teachers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTeachers();
  }, []);

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '60vh' }}>
      {/* Page header */}
      <Box sx={{ bgcolor: '#1a3a6b', color: '#fff', py: 3 }}>
        <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>师资队伍</Typography>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 2 }}>
        <Breadcrumb items={[{ label: '首页', to: '/' }, { label: '师资队伍' }]} />

        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : teachers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#999' }}>
            <Typography>暂无教师信息</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {teachers.map((teacher) => (
              <Grid item xs={12} sm={6} md={3} key={teacher.id}>
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
                    src={teacher.photo || 'https://via.placeholder.com/300x360?text=Teacher'}
                    alt={teacher.name}
                    sx={{ width: '100%', height: 220, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1a3a6b', mb: 0.5 }}>
                      {teacher.name}
                    </Typography>
                    {teacher.title && (
                      <Typography sx={{ fontSize: 14, color: '#666', mb: 1 }}>
                        {teacher.title}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap', mb: 1 }}>
                      {teacher.subject && <Chip label={teacher.subject} size="small" sx={{ fontSize: 12 }} />}
                      {teacher.years && <Chip label={`${teacher.years}年教龄`} size="small" color="primary" variant="outlined" sx={{ fontSize: 12 }} />}
                    </Box>
                    {teacher.bio && (
                      <Typography sx={{ fontSize: 13, color: '#999', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {teacher.bio}
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

export default TeacherListPage;
