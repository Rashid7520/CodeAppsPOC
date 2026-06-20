import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { PageHeaderProvider } from './layout/PageHeaderProvider'
import AppShell from './layout/AppShell'
import HomePage from './pages/HomePage'
import AssignmentsPage from './pages/AssignmentsPage'
import VehiclesPage from './pages/VehiclesPage'
import AssignVehiclePage from './pages/AssignVehiclePage'

function App() {
  return (
    <Router>
      <PageHeaderProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/assign" element={<AssignVehiclePage />} />
          </Route>
        </Routes>
      </PageHeaderProvider>
    </Router>
  )
}

export default App
