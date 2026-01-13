
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddRoom from './pages/AddRoom';
import MyRooms from './pages/MyRooms';
import RoomDetails from './pages/RoomDetails';
import RoleSelection from './pages/RoleSelection'; // Import RoleSelection
import EditRoom from './pages/EditRoom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Component to handle role-based redirection
const RoleGuard = ({ children, allowedRoles, allowGuest = false }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading application...</div>;

  // If not logged in
  if (!user) {
    if (allowGuest) return children;
    return <Navigate to="/" replace />;
  }

  // FALLBACK: If logged in but NO ROLE is assigned yet
  if (!role && location.pathname !== '/select-role') {
    return <Navigate to="/select-role" replace />;
  }

  // Role-based restrictions
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only room owners can access this page.</p>
        <button className="nav-btn" onClick={() => window.location.href = '/'}>Back to Home</button>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <RoleGuard allowGuest={true}>
                <Home />
              </RoleGuard>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/add-room" element={
              <RoleGuard allowedRoles={['room_owner']}>
                <AddRoom />
              </RoleGuard>
            } />
            <Route path="/my-rooms" element={
              <RoleGuard allowedRoles={['room_owner']}>
                <MyRooms />
              </RoleGuard>
            } />
            <Route path="/edit-room/:id" element={
              <RoleGuard allowedRoles={['room_owner']}>
                <EditRoom />
              </RoleGuard>
            } />
            <Route path="/room/:id" element={<RoomDetails />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
