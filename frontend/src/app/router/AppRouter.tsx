import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminPage from '../../modules/admin/pages/AdminPage';
import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';
import ForumAdminPage from '../../modules/forum/pages/adminPage';
import ForumPage from '../../modules/forum/pages/forumPage';
import ForumNewTopic from '../../modules/forum/pages/newTopic';
import ForumTopicDetail from '../../modules/forum/pages/topicDetail';
import CreatePlanPage from '../../modules/plans/pages/CreatePlanPage';
import EditPlanPage from '../../modules/plans/pages/EditPlanPage';
import { MapPage } from '../../modules/plans/pages/MapPage';
import PlanDetailPage from '../../modules/plans/pages/PlanDetailPage';
import PlansPage from '../../modules/plans/pages/PlansPage';

function isAuthenticated() {
  return Boolean(localStorage.getItem('token'));
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactElement }) {
  return isAuthenticated() ? <Navigate to="/mapa" replace /> : children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated() ? '/mapa' : '/login'} replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/mapa" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
      <Route path="/plans/new" element={<ProtectedRoute><CreatePlanPage /></ProtectedRoute>} />
      <Route path="/plans/:id" element={<ProtectedRoute><PlanDetailPage /></ProtectedRoute>} />
      <Route path="/plans/:id/edit" element={<ProtectedRoute><EditPlanPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
      <Route path="/forum/topic/:id" element={<ProtectedRoute><ForumTopicDetail /></ProtectedRoute>} />
      <Route path="/forum/new" element={<ProtectedRoute><ForumNewTopic /></ProtectedRoute>} />
      <Route path="/forum/admin" element={<ProtectedRoute><ForumAdminPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={isAuthenticated() ? '/mapa' : '/login'} replace />} />
    </Routes>
  );
}
