import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';

// Navigation components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import FamilyTree from './pages/FamilyTree';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Login from './pages/Login';
import RelationshipFinder from './pages/RelationshipFinder';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/AdminMembers';
import AdminPhotos from './pages/AdminPhotos';
import AdminSettings from './pages/AdminSettings';

export default function App() {
  return (
    <ThemeProvider>
      {/* 
        Note: The user specified that the application will be hosted on GitHub Pages.
        HashRouter is the standard and most robust router for GitHub Pages hosting,
        as it completely avoids 404 navigation routing issues when users refresh pages!
      */}
      <HashRouter>
        <div id="app-root-layout" className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-150 transition-colors duration-300 font-sans selection:bg-amber-600 selection:text-white">
          <Navbar />
          
          <main id="app-main-content" className="flex-grow flex flex-col justify-start">
            <Routes>
              {/* Public Views */}
              <Route path="/" element={<Home />} />
              <Route path="/tree" element={<FamilyTree />} />
              <Route path="/members" element={<Members />} />
              <Route path="/member/:id" element={<MemberProfile />} />
              <Route path="/relationship-finder" element={<RelationshipFinder />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Administration Views */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/members" element={<AdminMembers />} />
                <Route path="/admin/photos" element={<AdminPhotos />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              {/* Fallback to Home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />
        </div>
        
        {/* React Hot Toast configurations */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#18181b',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              borderRadius: '16px',
              border: '1px solid #f4f4f5',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#d97706',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </HashRouter>
    </ThemeProvider>
  );
}
