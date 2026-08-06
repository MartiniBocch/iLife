import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Layout from './layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Calendar from './pages/Calendar.jsx'
import Tasks from './pages/Tasks.jsx'
import Work from './pages/Work.jsx'
import Finances from './pages/Finances.jsx'
import Education from './pages/Education.jsx'
import Personal from './pages/Personal.jsx'
import Cycle from './pages/Cycle.jsx'
import './styles/globals.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="work" element={<Work />} />
          <Route path="finances" element={<Finances />} />
          <Route path="education" element={<Education />} />
          <Route path="personal" element={<Personal />} />
          <Route path="cycle" element={<Cycle />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App