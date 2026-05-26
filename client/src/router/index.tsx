import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import LoginPage from '../pages/admin/Login';
import DashboardPage from '../pages/admin/Dashboard';
import SitesPage from '../pages/admin/Sites';
import UsersPage from '../pages/admin/Users';
import SiteConfigPage from '../pages/admin/SiteConfig';

/** Protected route: redirects to login if not authenticated */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
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
      // Placeholder routes for future T03+ tasks
      { path: 'nodes', element: <PlaceholderPage title="栏目管理" /> },
      { path: 'articles', element: <PlaceholderPage title="文章管理" /> },
      { path: 'media', element: <PlaceholderPage title="文件管理" /> },
      { path: 'banners', element: <PlaceholderPage title="轮播图管理" /> },
      { path: 'friendlinks', element: <PlaceholderPage title="友链管理" /> },
      { path: 'leaders', element: <PlaceholderPage title="领导介绍" /> },
      { path: 'teachers', element: <PlaceholderPage title="师资队伍" /> },
      { path: 'navitems', element: <PlaceholderPage title="导航管理" /> },
      { path: 'quicklinks', element: <PlaceholderPage title="快捷入口" /> },
      { path: 'auditlogs', element: <PlaceholderPage title="操作日志" /> },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/admin" replace />,
  },
]);

/** Simple placeholder for future pages */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>{title}</h2>
      <p style={{ color: '#888' }}>该模块将在后续迭代中实现</p>
    </div>
  );
}
