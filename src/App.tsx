import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AdminActivityPage } from './pages/AdminActivityPage'
import { AdminPage } from './pages/AdminPage'
import { EventPage } from './pages/EventPage'
import { HomePage } from './pages/HomePage'
import { ProposePage } from './pages/ProposePage'
import { RecruitNewPage } from './pages/RecruitNewPage'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/propose" element={<ProposePage />} />
        <Route path="/recruit/new" element={<RecruitNewPage />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/activity/:id" element={<AdminActivityPage />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
