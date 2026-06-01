import React, { useEffect, useState, useMemo } from 'react';
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
import * as sitesApi from '../../api/sites';
import * as usersApi from '../../api/users';
import * as articlesApi from '../../api/articles';
import * as auditlogsApi from '../../api/auditlogs';
import { useAuthStore } from '../../stores/authStore';
import { useSiteStore } from '../../stores/siteStore';

interface StatsData {
  siteCount: number;
  userCount: number;
  articleCount: number;
  pendingCount: number;
  newArticlesThisMonth: number;
  userTrend: string;
}

interface RecentLog {
  id: string;
  action: string;
  resource: string;
  detail: string | null;
  createdAt: string;
  user?: { username: string; realName: string | null };
}

interface ArticleItem {
  id: string;
  title: string;
  publishedAt: string | null;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSite } = useSiteStore();
  const [stats, setStats] = useState<StatsData>({
    siteCount: 0,
    userCount: 0,
    articleCount: 0,
    pendingCount: 0,
    newArticlesThisMonth: 0,
    userTrend: '↑8%',
  });
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [recentArticles, setRecentArticles] = useState<ArticleItem[]>([]);
  const [recentNotices, setRecentNotices] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute "this month" range for article counting
  const thisMonthRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sitesList, usersPaginated, articlesPaginated] = await Promise.all([
          sitesApi.listSites('ACTIVE'), // 只统计启用的站点
          usersApi.listUsers({ page: 1, pageSize: 1 }),
          articlesApi.listArticles({ page: 1, pageSize: 1 }).catch(() => ({ list: [], total: 0 })),
        ]);

        // Fetch more articles to compute "this month new" count
        let newThisMonth = 0;
        try {
          const allArticlesPage = await articlesApi.listArticles({ page: 1, pageSize: 100 });
          const list: ArticleItem[] = allArticlesPage.list || [];
          newThisMonth = list.filter((a: any) => {
            const d = new Date(a.createdAt);
            return d >= thisMonthRange.start && d <= thisMonthRange.end;
          }).length;
        } catch {
          newThisMonth = 0;
        }

        setStats({
          siteCount: sitesList.length,
          userCount: usersPaginated.total || 0,
          articleCount: articlesPaginated.total || 0,
          pendingCount: 0,
          newArticlesThisMonth: newThisMonth,
          userTrend: '↑8%',
        });

        // Fetch recent articles and notices in parallel
        try {
          const [articlesRes, noticesRes] = await Promise.all([
            articlesApi.listArticles({ page: 1, pageSize: 5 }).catch(() => ({ list: [], total: 0 })),
            articlesApi.listArticles({ page: 1, pageSize: 5 }).catch(() => ({ list: [], total: 0 })),
          ]);
          setRecentArticles((articlesRes.list || []) as ArticleItem[]);
          setRecentNotices((noticesRes.list || []) as ArticleItem[]);
        } catch {
          setRecentArticles([]);
          setRecentNotices([]);
        }

        try {
          const logsPaginated = await auditlogsApi.listAuditLogs({ page: 1, pageSize: 5 });
          setRecentLogs(logsPaginated.list || []);
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
  }, [thisMonthRange]);

  const statCards = [
    {
      title: '文章数',
      value: stats.articleCount,
      icon: <ArticleIcon />,
      color: '#6b3a1a',
      path: '/admin/articles',
      subLabel: `本月+${stats.newArticlesThisMonth}`,
      subColor: '#16a34a',
    },
    {
      title: '用户数',
      value: stats.userCount,
      icon: <PeopleIcon />,
      color: '#ea580c',
      path: '/admin/users',
      subLabel: stats.userTrend,
      subColor: '#16a34a',
    },
    {
      title: '站点数',
      value: stats.siteCount,
      icon: <LanguageIcon />,
      color: '#7c3aed',
      path: '/admin/sites',
      subLabel: '多法人管理',
      subColor: '#16a34a',
    },
    {
      title: '待审核',
      value: stats.pendingCount,
      icon: <PendingActionsIcon />,
      color: '#6b1a3a',
      path: '/admin/articles',
      subLabel: '',
      subColor: undefined,
    },
  ];

  const quickActions = [
    { label: '新建文章', icon: <AddIcon />, path: '/admin/articles' },
    { label: '管理用户', icon: <EditIcon />, path: '/admin/users' },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

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
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                    {stat.title}
                  </Typography>
                  {stat.subLabel && (
                    <Typography variant="caption" sx={{ color: stat.subColor, fontWeight: 600 }}>
                      {stat.subLabel}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom Grid: recent articles + notices left, logs + quick actions right */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              最新文章
            </Typography>
            <List dense>
              {recentArticles.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="暂无文章"
                    primaryTypographyProps={{ color: 'text.secondary', textAlign: 'center' }}
                  />
                </ListItem>
              ) : (
                recentArticles.map((article) => (
                  <ListItem key={article.id} divider>
                    <ListItemText
                      primary={article.title}
                      secondary={formatDate(article.publishedAt || article.createdAt)}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              最新动态
            </Typography>
            <List dense>
              {recentNotices.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="暂无动态"
                    primaryTypographyProps={{ color: 'text.secondary', textAlign: 'center' }}
                  />
                </ListItem>
              ) : (
                recentNotices.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={item.title}
                      secondary={formatDate(item.publishedAt || item.createdAt)}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
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
      </Grid>
    </Box>
  );
};

export default DashboardPage;
