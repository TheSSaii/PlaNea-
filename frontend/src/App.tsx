import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ForumPage from './pages/ForumPage'
import TopicDetail from './pages/TopicDetail'
import NewTopic from './pages/NewTopic'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/topic/:id" element={<TopicDetail />} />
        <Route path="/forum/new" element={<NewTopic />} />
        <Route path="/admin/forum" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App