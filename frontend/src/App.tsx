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