import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Toolbar,
  Typography,
  Divider,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LanguageIcon from '@mui/icons-material/Language';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import MenuIcon from '@mui/icons-material/Menu';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import { usePermission } from '../../hooks/usePermission';
import { useAuthStore } from '../../stores/authStore';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  permission?: string;
}

const menuItems: MenuItem[] = [
  { text: '仪表盘', icon: <DashboardIcon />, path: '/admin' },
  { text: '站点管理', icon: <LanguageIcon />, path: '/admin/sites', permission: 'site:read' },
  { text: '用户管理', icon: <PeopleIcon />, path: '/admin/users', permission: 'user:read' },
  { text: '栏目管理', icon: <FolderIcon />, path: '/admin/nodes', permission: 'node:read' },
  { text: '文章管理', icon: <ArticleIcon />, path: '/admin/articles', permission: 'article:read' },
  { text: '文件管理', icon: <CloudUploadIcon />, path: '/admin/media', permission: 'media:read' },
  { text: '轮播图管理', icon: <ViewCarouselIcon />, path: '/admin/banners', permission: 'banner:read' },
  { text: '友情链接', icon: <LinkIcon />, path: '/admin/friendlinks', permission: 'friendlink:read' },
  { text: '领导介绍', icon: <PersonIcon />, path: '/admin/leaders', permission: 'leader:read' },
  { text: '师资管理', icon: <SchoolIcon />, path: '/admin/teachers', permission: 'teacher:read' },
  { text: '导航管理', icon: <MenuIcon />, path: '/admin/navitems', permission: 'node:read' },
  { text: '快捷入口', icon: <ShortcutIcon />, path: '/admin/quicklinks', permission: 'node:read' },
  { text: '操作日志', icon: <HistoryIcon />, path: '/admin/auditlogs', permission: 'user:read' },
  { text: '站点配置', icon: <SettingsIcon />, path: '/admin/siteconfig', permission: 'config:manage' },
];

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  width: number;
  isMobile: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, collapsed, width, isMobile, onToggle, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, isSuperAdmin } = usePermission();
  const user = useAuthStore((s) => s.user);

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true;
    if (isSuperAdmin) return true;
    const [resource, action] = item.permission.split(':');
    return hasPermission(resource, action);
  });

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          px: collapsed && !isMobile ? 0 : 2,
          minHeight: '64px !important',
          bgcolor: theme.palette.primary.main,
          color: 'white',
        }}
      >
        {(!collapsed || isMobile) && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            CMS 管理后台
          </Typography>
        )}
        {!isMobile && (
          <IconButton onClick={onToggle} sx={{ color: 'white' }}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ pt: 1 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 1,
                  minHeight: 44,
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                  bgcolor: isActive ? theme.palette.primary.main + '1A' : 'transparent',
                  color: isActive ? theme.palette.primary.main : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? theme.palette.primary.main + '2A' : theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed && !isMobile ? 0 : 40,
                    color: isActive ? theme.palette.primary.main : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: width,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
