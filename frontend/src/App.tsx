import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlansPage      from './assets/plans/pages/PlansPage';
import CreatePlanPage from './assets/plans/pages/CreatePlanPage';
import PlanDetailPage from './assets/plans/pages/PlanDetailPage';
import EditPlanPage   from './assets/plans/pages/EditPlanPage';
import AdminPage      from './assets/modules/admin/pages/AdminPage';
import ForumPage      from './pages/forum/forumPage';
import ForumTopicDetail from './pages/forum/topicDetail';
import ForumNewTopic  from './pages/forum/newTopic';
import ForumAdminPage from './pages/forum/adminPage';

// import LoginPage from './modules/auth/pages/LoginPage'; ← comentar si da error
// import RegisterPage from './modules/auth/pages/RegisterPage'; ← comentar si da error

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Navigate to="/plans" replace />} />
        <Route path="/plans"          element={<PlansPage />} />
        <Route path="/plans/new"      element={<CreatePlanPage />} />
        <Route path="/plans/:id"      element={<PlanDetailPage />} />
        <Route path="/plans/:id/edit" element={<EditPlanPage />} />
        <Route path="/admin"          element={<AdminPage />} />
        <Route path="/forum"          element={<ForumPage />} />
        <Route path="/forum/topic/:id" element={<ForumTopicDetail />} />
        <Route path="/forum/new"      element={<ForumNewTopic />} />
        <Route path="/forum/admin"    element={<ForumAdminPage />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
/*

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
*/
/*
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ForumPage from './pages/forum/forumPage'
import TopicDetail from './pages/forum/topicDetail'
import NewTopic from './pages/forum/newTopic'
import AdminPage from './pages/forum/adminPage'

function App() {
  return (
    <BrowserRouter>
    <div className="forum-root min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<ForumPage />} />
        <Route path="/topic/:id" element={<TopicDetail />} />
        <Route path="/new" element={<NewTopic />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App
*/
