import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, LogOut, LogIn, Users, GitMerge, Home, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check admin status on load and location change
  useEffect(() => {
    const admin = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(admin);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Family Tree', path: '/tree', icon: <GitMerge className="w-4 h-4" /> },
    { name: 'Browse Members', path: '/members', icon: <Users className="w-4 h-4" /> },
    { name: 'Relationship Finder', path: '/relationship-finder', icon: <GitMerge className="w-4 h-4" /> },
  ];

  return (
    <nav id="main-navbar" className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200/80 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link id="navbar-brand" to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full border-2 border-amber-600/90 dark:border-amber-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            </div>
            <div>
              <span className="font-semibold text-base sm:text-lg tracking-widest text-amber-700 dark:text-amber-500 uppercase font-sans">
                Athokpam
              </span>
              <span className="text-gray-500 dark:text-zinc-500 font-normal text-[10px] sm:text-[11px] block tracking-wider uppercase">
                Family Tree & Archives
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    id={`nav-link-${link.name.toLowerCase().replace(' ', '-')}`}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                        : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-950 dark:hover:text-white'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                );
              })}

              {isAdmin ? (
                <Link
                  id="nav-link-admin-dashboard"
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                      : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-950 dark:hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              ) : null}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800" />

            <div className="flex items-center gap-4">
              <ThemeToggle />

              {isAdmin ? (
                <button
                  id="btn-nav-logout"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-xs font-bold transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              ) : (
                <Link
                  id="btn-nav-login"
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-bold transition-all duration-200 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Admin Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Hamburguer Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen ? (
        <div id="mobile-nav-drawer" className="md:hidden bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                id={`mobile-nav-link-${link.name.toLowerCase().replace(' ', '-')}`}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}

          {isAdmin ? (
            <Link
              id="mobile-nav-link-admin"
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                location.pathname.startsWith('/admin')
                  ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          ) : null}

          <div className="h-px bg-gray-100 dark:bg-zinc-800 my-2" />

          {isAdmin ? (
            <button
              id="btn-mobile-logout"
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout Admin
            </button>
          ) : (
            <Link
              id="btn-mobile-login"
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              Admin Login
            </Link>
          )}
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
