import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/sections/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { InitiativeDetail } from './pages/InitiativeDetail'
import { Summary } from './pages/Summary'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/initiatives/:id" element={<InitiativeDetail />} />
              <Route path="/summary" element={<Summary />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
