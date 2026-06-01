import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Box, Container, IconButton, Drawer, List, ListItemButton, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as portalApi from '../../api/portal';
import type { NavTreeNode, PortalSite } from '../../api/portal';
import { DEFAULT_SITE_ID, PORTAL_MAX_WIDTH } from '../../utils/constants';

/** Top utility bar — phone, email, admin link */
const TopBar: React.FC<{ site: PortalSite | null }> = ({ site }) => (
  <Box
    sx={{
      bgcolor: '#0d2240',
      color: '#c8d6e5',
      fontSize: 13,
      py: 0.5,
    }}
  >
    <Container
      maxWidth={false}
      sx={{ maxWidth: PORTAL_MAX_WIDTH, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {site?.phone && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneIcon sx={{ fontSize: 14 }} />
            <span>{site.phone}</span>
          </Box>
        )}
        {site?.address && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <EmailIcon sx={{ fontSize: 14 }} />
            <span>{site.address}</span>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Link
          to="/admin"
          style={{ color: '#c8d6e5', textDecoration: 'none', fontSize: 13 }}
        >
          后台管理
        </Link>
      </Box>
    </Container>
  </Box>
);

/** Desktop navigation menu */
const DesktopNav: React.FC<{
  navTree: NavTreeNode[];
  onNavigate: (url: string) => void;
}> = ({ navTree, onNavigate }) => {
  const location = useLocation();

  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0, height: '100%' }}>
      {navTree.map((item) => {
        const isActive = location.pathname === item.url || (item.url && location.pathname.startsWith(item.url) && item.url !== '/');
        const hasChildren = item.children && item.children.length > 0;

        return (
          <Box
            key={item.id}
            sx={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              '&:hover > .sub-menu': { display: 'block' },
            }}
          >
            <Box
              onClick={() => {
                if (item.url) onNavigate(item.url);
              }}
              sx={{
                px: 2.5,
                py: 1,
                cursor: item.url ? 'pointer' : 'default',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
                bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontSize: 15,
                fontWeight: isActive ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' },
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
              {hasChildren && <ExpandMoreIcon sx={{ fontSize: 16 }} />}
            </Box>

            {hasChildren && (
              <Box
                className="sub-menu"
                sx={{
                  display: 'none',
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  minWidth: 180,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  borderRadius: '0 0 4px 4px',
                  zIndex: 1000,
                  py: 0.5,
                }}
              >
                {item.children.map((child) => (
                  <Box
                    key={child.id}
                    onClick={() => {
                      if (child.url) onNavigate(child.url);
                    }}
                    sx={{
                      px: 2,
                      py: 1.2,
                      cursor: child.url ? 'pointer' : 'default',
                      color: '#333',
                      fontSize: 14,
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: '#f0f4ff', color: '#1a3a6b' },
                    }}
                  >
                    {child.name}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

/** Mobile drawer menu */
const MobileNav: React.FC<{
  open: boolean;
  onClose: () => void;
  navTree: NavTreeNode[];
  onNavigate: (url: string) => void;
}> = ({ open, onClose, navTree, onNavigate }) => (
  <Drawer anchor="left" open={open} onClose={onClose}>
    <Box sx={{ width: 260, bgcolor: '#fff', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navTree.map((item) => (
          <React.Fragment key={item.id}>
            <ListItemButton
              onClick={() => {
                if (item.url) {
                  onNavigate(item.url);
                  onClose();
                }
              }}
            >
              <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
            </ListItemButton>
            {item.children && item.children.map((child) => (
              <ListItemButton
                key={child.id}
                sx={{ pl: 4 }}
                onClick={() => {
                  if (child.url) {
                    onNavigate(child.url);
                    onClose();
                  }
                }}
              >
                <ListItemText primary={child.name} primaryTypographyProps={{ fontSize: 14, color: '#666' }} />
              </ListItemButton>
            ))}
          </React.Fragment>
        ))}
      </List>
    </Box>
  </Drawer>
);

/** Main header with logo, nav, and search */
const MainHeader: React.FC<{
  site: PortalSite | null;
  navTree: NavTreeNode[];
  onNavigate: (url: string) => void;
  onSearch: (keyword: string) => void;
}> = ({ site, navTree, onNavigate, onSearch }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  return (
    <>
      <Box sx={{ bgcolor: '#1a3a6b', color: '#fff' }}>
        <Container
          maxWidth={false}
          sx={{
            maxWidth: PORTAL_MAX_WIDTH,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          {/* Logo + site name */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
            onClick={() => onNavigate('/')}
          >
            {site?.logo ? (
              <Box
                component="img"
                src={site.logo}
                alt={site.nameCn}
                sx={{ height: 40, objectFit: 'contain' }}
              />
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {site?.nameCn?.[0] || '学'}
              </Box>
            )}
            <Box sx={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
              {site?.nameCn || '官方网站'}
            </Box>
          </Box>

          {/* Desktop navigation */}
          <DesktopNav navTree={navTree} onNavigate={onNavigate} />

          {/* Search toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {searchOpen ? (
              <Box
                component="form"
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  if (searchText.trim()) {
                    onSearch(searchText.trim());
                    setSearchOpen(false);
                    setSearchText('');
                  }
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Box
                  component="input"
                  value={searchText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                  placeholder="搜索文章..."
                  autoFocus
                  sx={{
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    width: 180,
                    '&::placeholder': { color: 'rgba(255,255,255,0.5)' },
                  }}
                />
                <IconButton size="small" sx={{ color: '#fff' }} onClick={() => setSearchOpen(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <IconButton sx={{ color: '#fff' }} onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            )}

            {/* Mobile hamburger */}
            <IconButton
              sx={{ color: '#fff', display: { xs: 'flex', md: 'none' } }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navTree={navTree}
        onNavigate={onNavigate}
      />
    </>
  );
};

/** Footer component */
const PortalFooter: React.FC<{
  site: PortalSite | null;
  friendLinks: Array<{ id: string; name: string; url: string; logo: string | null }>;
}> = ({ site, friendLinks }) => (
  <Box sx={{ bgcolor: '#1a3a6b', color: '#c8d6e5', mt: 'auto' }}>
    <Container maxWidth={false} sx={{ maxWidth: PORTAL_MAX_WIDTH, py: 5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 4 }}>
        {/* Site description */}
        <Box>
          <Box sx={{ fontSize: 18, fontWeight: 700, color: '#fff', mb: 1.5 }}>
            {site?.nameCn || '学校官网'}
          </Box>
          <Box sx={{ fontSize: 13, lineHeight: 1.8, color: '#9bb5d0' }}>
            {site?.description || ''}
          </Box>
        </Box>

        {/* Quick links */}
        <Box>
          <Box sx={{ fontSize: 16, fontWeight: 600, color: '#fff', mb: 1.5 }}>快速通道</Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            <Link to="/news" style={{ color: '#9bb5d0', textDecoration: 'none', fontSize: 13 }}>新闻中心</Link>
            <Link to="/leaders" style={{ color: '#9bb5d0', textDecoration: 'none', fontSize: 13 }}>领导班子</Link>
            <Link to="/teachers" style={{ color: '#9bb5d0', textDecoration: 'none', fontSize: 13 }}>师资队伍</Link>
          </Box>
        </Box>

        {/* Contact info */}
        <Box>
          <Box sx={{ fontSize: 16, fontWeight: 600, color: '#fff', mb: 1.5 }}>联系我们</Box>
          <Box sx={{ fontSize: 13, lineHeight: 2, color: '#9bb5d0' }}>
            {site?.phone && <Box>电话：{site.phone}</Box>}
            {site?.address && <Box>地址：{site.address}</Box>}
          </Box>
        </Box>

        {/* Friend links */}
        <Box>
          <Box sx={{ fontSize: 16, fontWeight: 600, color: '#fff', mb: 1.5 }}>友情链接</Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {friendLinks.slice(0, 6).map((link) => (
              <Box
                key={link.id}
                component="a"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: '#9bb5d0', textDecoration: 'none', fontSize: 13, '&:hover': { color: '#fff' } }}
              >
                {link.name}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Bottom copyright */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 3, pt: 2, textAlign: 'center', fontSize: 12, color: '#7a9ab8' }}>
        <Box>© {new Date().getFullYear()} {site?.nameCn || '学校'} 版权所有</Box>
        <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {site?.icp && <Box>ICP备案：{site.icp}</Box>}
          {site?.police && <Box>公安备案：{site.police}</Box>}
        </Box>
      </Box>
    </Container>
  </Box>
);

/** Main portal layout */
const PortalLayout: React.FC = () => {
  const navigate = useNavigate();
  const [site, setSite] = useState<PortalSite | null>(null);
  const [navTree, setNavTree] = useState<NavTreeNode[]>([]);
  const [friendLinks, setFriendLinks] = useState<Array<{ id: string; name: string; url: string; logo: string | null }>>([]);

  useEffect(() => {
    const loadLayoutData = async () => {
      try {
        const data = await portalApi.getHomeData();
        setSite(data.site);
        setNavTree(data.navTree || []);
        setFriendLinks(data.friendLinks || []);
        
        // 动态设置页面 title 为学校名称
        if (data.site?.nameCn) {
          document.title = data.site.nameCn;
        }
      } catch (err) {
        console.error('Failed to load portal layout data:', err);
      }
    };
    loadLayoutData();
  }, []);

  const handleNavigate = (url: string) => {
    navigate(url);
  };

  const handleSearch = (keyword: string) => {
    navigate(`/news?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <TopBar site={site} />
      <MainHeader site={site} navTree={navTree} onNavigate={handleNavigate} onSearch={handleSearch} />
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <PortalFooter site={site} friendLinks={friendLinks} />
    </Box>
  );
};

export default PortalLayout;
