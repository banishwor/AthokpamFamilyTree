import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, LayoutDashboard, Settings, Users } from 'lucide-react';

/**
 * Mobile-only bottom tab bar for the admin section, so switching
 * between Dashboard / Members / Photos / Settings is one thumb-tap
 * instead of bouncing back through the dashboard. Renders nothing
 * outside /admin routes and nothing on md+ screens (desktop keeps
 * the dashboard cards + top navbar).
 */
export const AdminBottomNav: React.FC = () => {
  const location = useLocation();

  if (!location.pathname.startsWith('/admin')) {
    return null;
  }

  const tabs = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Members', path: '/admin/members', icon: Users, exact: false },
    { name: 'Photos', path: '/admin/photos', icon: Camera, exact: false },
    { name: 'Settings', path: '/admin/settings', icon: Settings, exact: false },
  ];

  return (
    <nav
      id="admin-bottom-nav"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Admin sections"
    >
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`min-h-[60px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${
                isActive
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-gray-500 dark:text-zinc-400'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminBottomNav;
