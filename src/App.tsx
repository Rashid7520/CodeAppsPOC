import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import AssignmentsPage from './pages/AssignmentsPage'
import VehiclesPage from './pages/VehiclesPage'
import AssignVehiclePage from './pages/AssignVehiclePage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/assign" element={<AssignVehiclePage />} />
      </Routes>
    </Router>
  )
}

export default App
