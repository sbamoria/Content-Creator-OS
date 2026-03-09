import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import LandingPageBuilder from './pages/LandingPageBuilder';
import LeadManagement from './pages/LeadManagement';
import Segments from './pages/Segments';
import EmailCampaigns from './pages/EmailCampaigns';
import WebinarManager from './pages/WebinarManager';
import Analytics from './pages/Analytics';
import PublicLandingPage from './pages/PublicLandingPage';
import PublicWebinarSignup from './pages/PublicWebinarSignup';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/lead/:pageId" element={<PublicLandingPage />} />
      <Route path="/webinar/:webinarId" element={<PublicWebinarSignup />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/builder" element={<PrivateRoute><LandingPageBuilder /></PrivateRoute>} />
      <Route path="/leads" element={<PrivateRoute><LeadManagement /></PrivateRoute>} />
      <Route path="/segments" element={<PrivateRoute><Segments /></PrivateRoute>} />
      <Route path="/campaigns" element={<PrivateRoute><EmailCampaigns /></PrivateRoute>} />
      <Route path="/webinars" element={<PrivateRoute><WebinarManager /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/auth'} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
