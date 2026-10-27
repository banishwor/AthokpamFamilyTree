import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Images, LayoutDashboard, MoreHorizontal, Plus, Users } from 'lucide-react';

/**
 * Mobile-only bottom tab bar for the admin section:
 * Home · Members · ＋ Add (centre) · Portraits · More.
 * Renders nothing outside /admin routes and nothing on md+ screens.
 */
export const AdminBottomNav: React.FC = () => {
  const location = useLocation();

  if (!location.pathname.startsWith('/admin')) {
    return null;
  }

  const sideTabs = [
    { name: 'Home', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Members', path: '/admin/members', icon: Users, exact: false },
    { name: 'Portraits', path: '/admin/photos', icon: Images, exact: false },
    { name: 'More', path: '/admin/settings', icon: MoreHorizontal, exact: false },
  ];

  const renderTab = (tab: (typeof sideTabs)[number]) => {
    const isActive = tab.exact
      ? location.pathname === tab.path
      : location.pathname.startsWith(tab.path);
    const Icon = tab.icon;
    return (
      <Link
        key={tab.path}
        to={tab.path}
        className={`min-h-[60px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${
          isActive ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-zinc-400'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="w-6 h-6" />
        {tab.name}
      </Link>
    );
  };

  return (
    <nav
      id="admin-bottom-nav"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Admin sections"
    >
      <div className="grid grid-cols-5 items-end">
        {renderTab(sideTabs[0])}
        {renderTab(sideTabs[1])}
        <Link
          to="/admin/members?new=1"
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-gray-500 dark:text-zinc-400 min-h-[60px]"
          aria-label="Add a new member"
        >
          <span className="w-12 h-12 -mt-6 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-900">
            <Plus className="w-6 h-6" />
          </span>
          Add
        </Link>
        {renderTab(sideTabs[2])}
        {renderTab(sideTabs[3])}
      </div>
    </nav>
  );
};

export default AdminBottomNav;
