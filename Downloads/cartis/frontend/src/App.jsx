import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/auth/LoginModal'
import Signup from './pages/auth/SignupModal'
import Home from './pages/shared/Home'
import Dashboard from './pages/shared/Dashboard'
import CartonList from './pages/shared/CartonList'
import CartonDetail from './pages/shared/CartonDetail'

// Role Pages
import RegisterCarton from './pages/business/RegisterCarton'
import MyRequests from './pages/business/MyRequests'
import VendorQueue from './pages/vendor/VendorQueue'
import PendingDestructions from './pages/compliance/PendingDestructions'
import LegalHolds from './pages/compliance/LegalHolds'
import Reconciliation from './pages/facility/Reconciliation'
import Exceptions from './pages/facility/Exceptions'
import UserAdmin from './pages/facility/UserAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route path="/app/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/app/cartons" element={
            <ProtectedRoute><CartonList /></ProtectedRoute>
          } />
          <Route path="/app/cartons/new" element={
            <ProtectedRoute allowedRoles={['BUSINESS', 'ROLE-BIZ-USER']}><RegisterCarton /></ProtectedRoute>
          } />
          <Route path="/app/cartons/:id" element={
            <ProtectedRoute><CartonDetail /></ProtectedRoute>
          } />
          <Route path="/app/requests" element={
            <ProtectedRoute allowedRoles={['BUSINESS', 'ROLE-BIZ-USER']}><MyRequests /></ProtectedRoute>
          } />

          {/* Vendor */}
          <Route path="/app/vendor/queue" element={
            <ProtectedRoute allowedRoles={['VENDOR', 'ROLE-VENDOR']}><VendorQueue /></ProtectedRoute>
          } />

          {/* Compliance */}
          <Route path="/app/compliance/destructions" element={
            <ProtectedRoute allowedRoles={['COMPLIANCE', 'ROLE-COMPLIANCE']}><PendingDestructions /></ProtectedRoute>
          } />
          <Route path="/app/compliance/holds" element={
            <ProtectedRoute allowedRoles={['COMPLIANCE', 'ROLE-COMPLIANCE']}><LegalHolds /></ProtectedRoute>
          } />

          {/* Facility */}
          <Route path="/app/facility/reconciliation" element={
            <ProtectedRoute allowedRoles={['FACILITY', 'ROLE-FACILITY']}><Reconciliation /></ProtectedRoute>
          } />
          <Route path="/app/facility/exceptions" element={
            <ProtectedRoute allowedRoles={['FACILITY', 'ROLE-FACILITY']}><Exceptions /></ProtectedRoute>
          } />
          <Route path="/app/facility/users" element={
            <ProtectedRoute allowedRoles={['FACILITY', 'ROLE-FACILITY']}><UserAdmin /></ProtectedRoute>
          } />

          {/* Home & Fallback */}
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
