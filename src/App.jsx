import { BrowserRouter, Routes, Route, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import Landing from "./pages/Landing"
import AuthForm from "./pages/Authform"
import Flowers from "./pages/Flowers"
import CommunityChat from "./pages/Community"
import Profile from "./pages/Profile"
import Navbar from "./Components/Navbar"
import { LanguageProvider } from './context/LanguageContext';

// Wrapper component to handle protected routes with Navbar
const ProtectedRoute = ({ children }) => {
  const { id } = useParams();
  return (
    <>
      <Navbar id={id} />
      {children}
    </>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<AuthForm />} />

          {/* Protected routes with Navbar */}
          <Route 
            path="/flowers/:id" 
            element={
              <ProtectedRoute>
                <Flowers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community/:id" 
            element={
              <ProtectedRoute>
                <CommunityChat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:id" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}