import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Hide the footer on the Interactive Tree view page to maximize screen space for the tree explorer.
  if (location.pathname === '/tree') {
    return null;
  }

  return (
    <footer id="main-footer" className="bg-gray-50 dark:bg-zinc-950 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border border-amber-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
              </div>
              <span className="font-semibold tracking-widest text-[#ae8b47] dark:text-[#c5a059] uppercase text-xs">
                ATHOKPAM FAMILY TRUST
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
              Dedicated to preserving the rich genealogy, heritage, and historic records of the Athokpam family lineage. Handed down across generations, from ancestry to descendants.
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Explore History
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link id="footer-link-home" to="/" className="text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Home Dashboard
                </Link>
              </li>
              <li>
                <Link id="footer-link-tree" to="/tree" className="text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Interactive Genealogy Tree
                </Link>
              </li>
              <li>
                <Link id="footer-link-members" to="/members" className="text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Browse Ancestry Members
                </Link>
              </li>
              <li>
                <Link id="footer-link-login" to="/login" className="text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Administrative Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Heritage Quote */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Lineage & Legacy
            </h3>
            <p className="text-xs italic text-gray-400 dark:text-zinc-500 leading-relaxed">
              "Like branches on a tree, we grow in different directions, yet our roots remain as one."
            </p>
            <div className="text-xs text-gray-400 dark:text-zinc-500">
              Preserved with meticulous historical records.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 dark:text-zinc-500">
          <div>
            © {currentYear} Athokpam Family Tree. All rights reserved. Registered heritage portal.
          </div>
          <div className="flex items-center gap-1">
            <span>Preserved with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for future generations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
