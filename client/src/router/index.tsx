import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { PortalLayout } from '../components/Portal';
import LoginPage from '../pages/admin/Login';
import DashboardPage from '../pages/admin/Dashboard';
import SitesPage from '../pages/admin/Sites';
import UsersPage from '../pages/admin/Users';
import SiteConfigPage from '../pages/admin/SiteConfig';
import NodesPage from '../pages/admin/Nodes';
import ArticlesPage from '../pages/admin/Articles';
import ArticleEditPage from '../pages/admin/ArticleEdit';
import MediaPage from '../pages/admin/Media';
import BannersPage from '../pages/admin/Banners';
import FriendLinksPage from '../pages/admin/FriendLinks';
import LeadersPage from '../pages/admin/Leaders';
import TeachersPage from '../pages/admin/Teachers';
import NavItemsPage from '../pages/admin/NavItems';
import QuickLinksPage from '../pages/admin/QuickLinks';
import AuditLogsPage from '../pages/admin/AuditLogs';
import NotificationsPage from '../pages/admin/Notifications';
import HomePage from '../pages/portal/Home';
import NewsListPage from '../pages/portal/NewsList';
import NewsDetailPage from '../pages/portal/NewsDetail';
import LeaderListPage from '../pages/portal/LeaderList';
import TeacherListPage from '../pages/portal/TeacherList';

/** Protected route: redirects to login if not authenticated */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  // Portal (public) routes
  {
    path: '/',
    element: <PortalLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'news', element: <NewsListPage /> },
      { path: 'news/:id', element: <NewsDetailPage /> },
      { path: 'leaders', element: <LeaderListPage /> },
      { path: 'teachers', element: <TeacherListPage /> },
    ],
  },
  // Login
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Admin (protected) routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'sites', element: <SitesPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'siteconfig', element: <SiteConfigPage /> },
      // T03: Core management pages
      { path: 'nodes', element: <NodesPage /> },
      { path: 'articles', element: <ArticlesPage /> },
      { path: 'articles/edit/:id', element: <ArticleEditPage /> },
      { path: 'media', element: <MediaPage /> },
      // T04: Business function pages
      { path: 'banners', element: <BannersPage /> },
      { path: 'friendlinks', element: <FriendLinksPage /> },
      { path: 'leaders', element: <LeadersPage /> },
      { path: 'teachers', element: <TeachersPage /> },
      { path: 'navitems', element: <NavItemsPage /> },
      { path: 'quicklinks', element: <QuickLinksPage /> },
      { path: 'auditlogs', element: <AuditLogsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
    ],
  },
]);
