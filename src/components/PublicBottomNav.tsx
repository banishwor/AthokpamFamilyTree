import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitMerge, Home, Images, Network, Users } from 'lucide-react';

/**
 * Mobile-only bottom tab bar for the PUBLIC site — the piece the
 * approved mockup had and the first build missed:
 * Home · Tree · Members · Charts · Related.
 * Shows only on the main public routes (app-style routes like
 * /admin, /tree, /quick-update, /login and the chart viewers keep
 * their own full-screen chrome) and never on md+ screens.
 */
const VISIBLE_PREFIXES = ['/members', '/member/', '/charts', '/relationship-finder'];

export const PublicBottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const visible = path === '/' || VISIBLE_PREFIXES.some((p) => path.startsWith(p));
  if (!visible) return null;

  const tabs = [
    { name: 'Home', path: '/', icon: Home, exact: true },
    { name: 'Tree', path: '/tree', icon: GitMerge, exact: false },
    { name: 'Members', path: '/members', icon: Users, exact: false },
    { name: 'Charts', path: '/charts', icon: Images, exact: true },
    { name: 'Related', path: '/relationship-finder', icon: Network, exact: false },
  ];

  return (
    <>
      {/* In-flow spacer so page content (and the slim footer) never
          hides behind the fixed bar. */}
      <div aria-hidden className="md:hidden" style={{ height: 'calc(64px + env(safe-area-inset-bottom))' }} />
      <nav
        id="public-bottom-nav"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Public sections"
      >
        <div className="grid grid-cols-5">
          {tabs.map((tab) => {
            const isActive = tab.exact ? path === tab.path : path.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`min-h-[64px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${
                  isActive ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-zinc-400'
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
    </>
  );
};

export default PublicBottomNav;
