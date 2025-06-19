
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/admin/Dashboard';
import AdminPanel from './components/admin/AdminPanel';
import Settings from './components/settings/Settings';
import PaymentDashboard from './components/payment/PaymentDashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <ChatInterface />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/panel" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute>
                  <PaymentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;