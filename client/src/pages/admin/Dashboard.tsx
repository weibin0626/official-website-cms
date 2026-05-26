import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LanguageIcon from '@mui/icons-material/Language';
import ArticleIcon from '@mui/icons-material/Article';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { useSiteStore } from '../../stores/siteStore';

interface StatsData {
  siteCount: number;
  userCount: number;
  articleCount: number;
  pendingCount: number;
}

interface RecentLog {
  id: string;
  action: string;
  resource: string;
  detail: string | null;
  createdAt: string;
  user?: { username: string; realName: string | null };
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSite } = useSiteStore();
  const [stats, setStats] = useState<StatsData>({ siteCount: 0, userCount: 0, articleCount: 0, pendingCount: 0 });
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sitesRes, usersRes, articlesRes] = await Promise.all([
          apiClient.get('/sites'),
          apiClient.get('/users', { params: { page: 1, pageSize: 1 } }),
          apiClient.get('/articles', { params: { page: 1, pageSize: 1 } }).catch(() => ({ data: { data: { total: 0 } } })),
        ]);

        setStats({
          siteCount: Array.isArray(sitesRes.data.data) ? sitesRes.data.data.length : 0,
          userCount: usersRes.data.data?.total || 0,
          articleCount: articlesRes.data.data?.total || 0,
          pendingCount: 0,
        });

        try {
          const logsRes = await apiClient.get('/audit-logs', { params: { page: 1, pageSize: 5 } });
          setRecentLogs(logsRes.data.data?.list || []);
        } catch {
          setRecentLogs([]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: '站点数', value: stats.siteCount, icon: <LanguageIcon />, color: '#1a3a6b', path: '/admin/sites' },
    { title: '用户数', value: stats.userCount, icon: <PeopleIcon />, color: '#1a6b3a', path: '/admin/users' },
    { title: '文章数', value: stats.articleCount, icon: <ArticleIcon />, color: '#6b3a1a', path: '/admin/articles' },
    { title: '待审核', value: stats.pendingCount, icon: <PendingActionsIcon />, color: '#6b1a3a', path: '/admin/articles' },
  ];

  const quickActions = [
    { label: '新建文章', icon: <AddIcon />, path: '/admin/articles' },
    { label: '管理用户', icon: <EditIcon />, path: '/admin/users' },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        仪表盘
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        欢迎回来，{user?.realName || user?.username}！
        {currentSite && ` 当前站点：${currentSite.nameCn}`}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: stat.color + '1A',
                    color: stat.color,
                    '& .MuiSvgIcon-root': { fontSize: 28 },
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              最近操作日志
            </Typography>
            <List dense>
              {recentLogs.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="暂无操作日志"
                    primaryTypographyProps={{ color: 'text.secondary', textAlign: 'center' }}
                  />
                </ListItem>
              ) : (
                recentLogs.map((log) => (
                  <ListItem key={log.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={log.action} size="small" variant="outlined" />
                          <Typography variant="body2">{log.detail || log.resource}</Typography>
                        </Box>
                      }
                      secondary={`${log.user?.username || 'System'} · ${new Date(log.createdAt).toLocaleString('zh-CN')}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              快捷操作
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outlined"
                  startIcon={action.icon}
                  onClick={() => navigate(action.path)}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
