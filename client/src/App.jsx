import { Route, Routes } from 'react-router';
import AppLayout from './components/AppLayout';
import { GuestOnly, RequireAuth } from './components/RouteGuards';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import CoursesPage from './pages/CoursesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="courses" element={<CoursesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
