import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import URLs from './pages/URLs';
import ChatHistory from './pages/ChatHistory';

function App() {
  const PrivateRoute = ({ children }) => {
    const auth = localStorage.getItem('isAuthenticated');
    return auth === 'true' ? (
      <Layout>{children}</Layout>
    ) : (
      <Navigate to="/login" />
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <URLs />
            </PrivateRoute>
          }
        />
        <Route
          path="/urls"
          element={
            <PrivateRoute>
              <URLs />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat-history"
          element={
            <PrivateRoute>
              <ChatHistory />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
