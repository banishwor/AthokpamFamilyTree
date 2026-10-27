import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';

// Navigation components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminBottomNav from './components/AdminBottomNav';

// Public pages
import Home from './pages/Home';
import FamilyTree from './pages/FamilyTree';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import DescendantChart from './pages/DescendantChart';
import Login from './pages/Login';
import RelationshipFinder from './pages/RelationshipFinder';
import QuickUpdate from './pages/QuickUpdate';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/AdminMembers';
import AdminPhotos from './pages/AdminPhotos';
import AdminSettings from './pages/AdminSettings';

/**
 * Site chrome (Navbar / Footer) wrapper. The app-style routes —
 * admin, Quick Update and Login — run full-screen on phones with
 * no global header or footer, like a native app. Desktop and the
 * public pages keep the full site chrome.
 */
const APP_ROUTES_ON_MOBILE = ['/admin', '/quick-update', '/login', '/tree'];

const SiteChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const bareOnMobile = APP_ROUTES_ON_MOBILE.some((p) => location.pathname.startsWith(p));
  return <div className={bareOnMobile ? 'hidden md:block' : undefined}>{children}</div>;
};

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
          <SiteChrome>
            <Navbar />
          </SiteChrome>
          
          <main id="app-main-content" className="flex-grow flex flex-col justify-start">
            <Routes>
              {/* Public Views */}
              <Route path="/" element={<Home />} />
              <Route path="/tree" element={<FamilyTree />} />
              <Route path="/members" element={<Members />} />
              <Route path="/member/:id" element={<MemberProfile />} />
              <Route path="/chart/:id" element={<DescendantChart />} />
              <Route path="/relationship-finder" element={<RelationshipFinder />} />
              <Route path="/login" element={<Login />} />
              <Route path="/quick-update" element={<QuickUpdate />} />

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

          <SiteChrome>
            <Footer />
          </SiteChrome>
          <AdminBottomNav />
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
