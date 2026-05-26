import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuthStore } from '../../stores/authStore';
import { useSiteStore } from '../../stores/siteStore';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 64;

const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuth, user } = useAuthStore();
  const { fetchSites } = useSiteStore();

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        const valid = await checkAuth();
        if (!valid) {
          navigate('/login', { replace: true });
          return;
        }
      }
      if (isAuthenticated && !user) {
        await checkAuth();
      }
      await fetchSites();
    };
    init();
  }, []);

  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile, location.pathname]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setDrawerOpen(!drawerOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <CssBaseline />
      <Sidebar
        open={drawerOpen}
        collapsed={collapsed}
        width={drawerWidth}
        isMobile={isMobile}
        onToggle={handleDrawerToggle}
        onClose={() => setDrawerOpen(false)}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: isMobile ? 0 : `${drawerWidth}px`,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <TopBar onToggleSidebar={handleDrawerToggle} collapsed={collapsed} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
