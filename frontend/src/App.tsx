import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ForumPage from './pages/forum/forumPage'
import TopicDetail from './pages/forum/topicDetail'
import NewTopic from './pages/forum/newTopic'
import AdminPage from './pages/forum/adminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ForumPage />} />
        <Route path="/topic/:id" element={<TopicDetail />} />
        <Route path="/new" element={<NewTopic />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App