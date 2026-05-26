import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Grid, Card, CardContent, CardMedia, Typography, Chip, IconButton, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import PublicIcon from '@mui/icons-material/Public';
import * as portalApi from '../../api/portal';
import type { HomeData, PortalArticle } from '../../api/portal';
import { formatDate, truncateText, stripHtml } from '../../utils/formatters';
import { DEFAULT_SITE_ID, PORTAL_MAX_WIDTH } from '../../utils/constants';

/** Auto-play banner carousel */
const BannerCarousel: React.FC<{ banners: HomeData['banners'] }> = ({ banners }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <Box sx={{ height: { xs: 200, md: 400 }, bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">暂无轮播图</Typography>
      </Box>
    );
  }

  const goTo = (index: number) => {
    setCurrent(index);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden', height: { xs: 200, md: 400 } }}>
      {banners.map((banner, idx) => (
        <Box
          key={banner.id}
          component={banner.linkUrl ? 'a' : 'div'}
          href={banner.linkUrl || undefined}
          target={banner.linkUrl ? '_blank' : undefined}
          rel={banner.linkUrl ? 'noopener noreferrer' : undefined}
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: idx === current ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={banner.imageUrl}
            alt={banner.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      ))}
      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <IconButton
            onClick={() => goTo((current - 1 + banners.length) % banners.length)}
            sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.3)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={() => goTo((current + 1) % banners.length)}
            sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.3)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
          >
            <ChevronRightIcon />
          </IconButton>
          {/* Indicators */}
          <Box sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
            {banners.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => goTo(idx)}
                sx={{
                  width: idx === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: idx === current ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

/** Quick links section */
const QuickLinksSection: React.FC<{ links: HomeData['quickLinks'] }> = ({ links }) => {
  const icons = [SchoolIcon, PeopleIcon, ArticleIcon, PublicIcon];

  if (links.length === 0) return null;

  return (
    <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 4 }}>
      <Grid container spacing={2}>
        {links.slice(0, 4).map((link, idx) => {
          const IconComponent = icons[idx % icons.length];
          return (
            <Grid item xs={6} sm={3} key={link.id}>
              <Box
                component="a"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 3,
                  bgcolor: '#fff',
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent sx={{ fontSize: 28, color: '#1a3a6b' }} />
                </Box>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{link.name}</Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

/** Section title component */
const SectionTitle: React.FC<{ title: string; moreLink?: string }> = ({ title, moreLink }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ width: 4, height: 24, bgcolor: '#1a3a6b', borderRadius: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a3a6b', fontSize: 20 }}>
        {title}
      </Typography>
    </Box>
    {moreLink && (
      <Box
        component={Link}
        to={moreLink}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#666', textDecoration: 'none', fontSize: 14, '&:hover': { color: '#1a3a6b' } }}
      >
        更多 <ArrowForwardIcon sx={{ fontSize: 14 }} />
      </Box>
    )}
  </Box>
);

/** Featured article card */
const ArticleCard: React.FC<{ article: PortalArticle }> = ({ article }) => (
  <Card
    component={Link}
    to={`/news/${article.id}`}
    sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' } }}
  >
    {article.coverImage && (
      <CardMedia component="img" height={160} image={article.coverImage} alt={article.title} sx={{ objectFit: 'cover' }} />
    )}
    <CardContent sx={{ flex: 1, pt: article.coverImage ? 1.5 : 2 }}>
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1a3a6b', mb: 1, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {article.title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#999', mb: 1 }}>
        {article.node?.name || ''}
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {truncateText(stripHtml(article.content), 80)}
      </Typography>
    </CardContent>
  </Card>
);

/** Announcement list item */
const AnnouncementItem: React.FC<{ article: PortalArticle }> = ({ article }) => (
  <Box
    component={Link}
    to={`/news/${article.id}`}
    sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.2, borderBottom: '1px dashed #e8e8e8', textDecoration: 'none', color: 'inherit', '&:hover': { color: '#1a3a6b' } }}
  >
    {article.publishedAt && (
      <Box sx={{ minWidth: 56, textAlign: 'center', flexShrink: 0 }}>
        <Box sx={{ fontSize: 22, fontWeight: 700, color: '#1a3a6b', lineHeight: 1 }}>
          {new Date(article.publishedAt).getDate()}
        </Box>
        <Box sx={{ fontSize: 12, color: '#999' }}>
          {formatDate(article.publishedAt).slice(0, 7)}
        </Box>
      </Box>
    )}
    <Typography sx={{ fontSize: 14, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
      {article.title}
    </Typography>
  </Box>
);

/** Animated counter component */
const AnimatedCounter: React.FC<{ end: number; label: string; suffix?: string }> = ({ end, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const step = end / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <Box ref={ref} sx={{ textAlign: 'center', py: 2 }}>
      <Typography sx={{ fontSize: { xs: 32, md: 42 }, fontWeight: 800, color: '#1a3a6b' }}>
        {count.toLocaleString()}{suffix}
      </Typography>
      <Typography sx={{ fontSize: 14, color: '#666', mt: 0.5 }}>{label}</Typography>
    </Box>
  );
};

/** Home page component */
const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHome = async () => {
      try {
        const result = await portalApi.getHomeData(DEFAULT_SITE_ID || undefined);
        setData(result);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHome();
  }, []);

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (!data) return null;

  return (
    <Box>
      {/* Banner */}
      <BannerCarousel banners={data.banners} />

      {/* Quick links */}
      <QuickLinksSection links={data.quickLinks} />

      {/* News + Announcements */}
      <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 4 }}>
        <Grid container spacing={4}>
          {/* Left: Featured articles */}
          <Grid item xs={12} md={7}>
            <SectionTitle title="学校要闻" moreLink="/news" />
            <Grid container spacing={2}>
              {data.featuredArticles.slice(0, 4).map((article) => (
                <Grid item xs={12} sm={6} key={article.id}>
                  <ArticleCard article={article} />
                </Grid>
              ))}
            </Grid>
          </Grid>
          {/* Right: Announcements */}
          <Grid item xs={12} md={5}>
            <SectionTitle title="通知公告" moreLink="/news" />
            <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {data.announcements.slice(0, 8).map((article) => (
                <AnnouncementItem key={article.id} article={article} />
              ))}
              {data.announcements.length === 0 && (
                <Typography sx={{ textAlign: 'center', color: '#999', py: 3 }}>暂无通知公告</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Stats section */}
      <Box sx={{ bgcolor: '#e8f0fe', py: 5 }}>
        <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH }}>
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <AnimatedCounter end={1200} label="在校学生" suffix="+" />
            </Grid>
            <Grid item xs={6} md={3}>
              <AnimatedCounter end={85} label="优秀教师" suffix="+" />
            </Grid>
            <Grid item xs={6} md={3}>
              <AnimatedCounter end={50} label="教学班级" suffix="+" />
            </Grid>
            <Grid item xs={6} md={3}>
              <AnimatedCounter end={98} label="升学率" suffix="%" />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Leaders section */}
      {data.leaders.length > 0 && (
        <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 4 }}>
          <SectionTitle title="领导班子" moreLink="/leaders" />
          <Grid container spacing={2}>
            {data.leaders.slice(0, 4).map((leader) => (
              <Grid item xs={6} sm={3} key={leader.id}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <Box
                    component="img"
                    src={leader.photo || 'https://via.placeholder.com/150x180?text=Leader'}
                    alt={leader.name}
                    sx={{ width: 120, height: 144, objectFit: 'cover', borderRadius: 1, mb: 1.5 }}
                  />
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a3a6b' }}>{leader.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#666' }}>{leader.position}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* Teachers section */}
      {data.teachers.length > 0 && (
        <Box sx={{ bgcolor: '#fff', py: 4 }}>
          <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH }}>
            <SectionTitle title="师资队伍" moreLink="/teachers" />
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 3 } }}>
              {data.teachers.slice(0, 10).map((teacher) => (
                <Box
                  key={teacher.id}
                  sx={{ minWidth: 200, textAlign: 'center', p: 2, bgcolor: '#f8f9fb', borderRadius: 2, flexShrink: 0 }}
                >
                  <Box
                    component="img"
                    src={teacher.photo || 'https://via.placeholder.com/150x180?text=Teacher'}
                    alt={teacher.name}
                    sx={{ width: 100, height: 120, objectFit: 'cover', borderRadius: 1, mb: 1.5 }}
                  />
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1a3a6b' }}>{teacher.name}</Typography>
                  {teacher.title && <Typography sx={{ fontSize: 12, color: '#666' }}>{teacher.title}</Typography>}
                  {teacher.subject && <Chip label={teacher.subject} size="small" sx={{ mt: 0.5, fontSize: 11 }} />}
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Friend links */}
      {data.friendLinks.length > 0 && (
        <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#666', whiteSpace: 'nowrap' }}>友情链接：</Typography>
            {data.friendLinks.map((link) => (
              <Box
                key={link.id}
                component="a"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: '#666', textDecoration: 'none', fontSize: 13, '&:hover': { color: '#1a3a6b' } }}
              >
                {link.name}
              </Box>
            ))}
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default HomePage;
