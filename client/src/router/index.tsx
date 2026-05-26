import { createBrowserRouter } from 'react-router-dom';

const LoginPage = () => <div style={{padding: '20px', textAlign: 'center'}}><h1>CMS登录页面</h1><p>T01基础设施已就绪，T02将实现完整登录功能</p></div>;
const DashboardPage = () => <div style={{padding: '20px'}}><h1>仪表盘</h1><p>待T02实现</p></div>;
const HomePage = () => <div style={{padding: '20px', textAlign: 'center'}}><h1>前台官网</h1><p>待T05实现</p></div>;

export const router = createBrowserRouter([
  { path: '/admin/login', element: <LoginPage /> },
  { path: '/admin', element: <DashboardPage /> },
  { path: '/', element: <HomePage /> },
]);
