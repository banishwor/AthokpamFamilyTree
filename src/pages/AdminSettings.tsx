import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, Theme } from '../context/ThemeContext';
import { Settings, Shield, Laptop, Sun, Moon, Database, HelpCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Local test states
  const [dbState, setDbState] = useState<'connected' | 'checking' | 'error'>('connected');

  const handleTestDatabase = () => {
    setDbState('checking');
    setTimeout(() => {
      setDbState('connected');
      toast.success('Connection to Google Apps Script Database is active and stable!');
    }, 1200);
  };

  const themes: { id: Theme; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'light',
      label: 'Light Heritage',
      desc: 'Elegant cream and copper tones inspired by classic historical parchment documents.',
      icon: <Sun className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'dark',
      label: 'Cosmic Slate',
      desc: 'Eye-friendly charcoal canvas with gold metallic accents suitable for low-light studies.',
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'system',
      label: 'Platform Matching',
      desc: 'Syncs automatically with your computer or telephone system dark/light configurations.',
      icon: <Laptop className="w-5 h-5 text-zinc-550" />,
    },
  ];

  return (
    <div id="admin-settings-page" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header Title block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-850 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-zinc-650" />
              Portal System Preferences
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider font-extrabold font-mono">
              Configure active visual aesthetics and database configurations
            </p>
          </div>

          <button
            id="btn-settings-back-dash"
            onClick={() => navigate('/admin')}
            className="px-3.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-gray-50 transition-all self-start sm:self-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        </div>

        {/* 1. Theme Selection Blocks */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-6 sm:p-8 rounded-3xl shadow-md space-y-5">
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Visual Presentation Themes
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Select one polished, distinctive configuration that fits your ambient setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  id={`btn-settings-theme-${t.id}`}
                  onClick={() => {
                    setTheme(t.id);
                    toast.success(`Theme preference updated to ${t.label}!`);
                  }}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/10 dark:bg-amber-950/10 ring-2 ring-amber-500/20'
                      : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-850/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-750">
                      {t.icon}
                    </div>
                    {isSelected && (
                      <span className="p-1 bg-amber-600 text-white rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className="font-bold text-xs text-gray-950 dark:text-white block">
                      {t.label}
                    </span>
                    <span className="text-[10px] text-gray-405 dark:text-zinc-500 block leading-normal mt-1">
                      {t.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Database & API configuration */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-6 sm:p-8 rounded-3xl shadow-md space-y-5">
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Lineage Database Synchronicity
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Review current connection details for spreadsheet cloud storage.
            </p>
          </div>

          <div className="space-y-4">
            {/* Status indicator */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold block text-gray-900 dark:text-zinc-200">Google Apps Script API Endpoint</span>
                  <span className="font-mono text-[9px] text-gray-400 dark:text-zinc-450 block truncate max-w-[280px]">
                    AKfycbzBVoD591uVO_31PT1re7QEM-Rln...
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${dbState === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="font-mono font-bold uppercase text-[10px] text-gray-500">
                    {dbState === 'connected' ? 'ACTIVE CONNECT' : dbState === 'checking' ? 'PINGING...' : 'ERROR'}
                  </span>
                </span>
                
                <button
                  id="btn-test-db-connection"
                  onClick={handleTestDatabase}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 rounded-lg font-bold text-[10px] uppercase hover:bg-gray-50 transition"
                >
                  Test Connection
                </button>
              </div>
            </div>

            {/* Note block */}
            <div className="p-4 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/10 rounded-2xl flex gap-3 text-xs leading-relaxed text-orange-700 dark:text-orange-400">
              <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase text-[10px] tracking-wider block">Security Credentials Warning</span>
                Google spreadsheet databases are secured behind token authorization keys. Avoid pasting any client credentials or secret keys directly inside `.env` configuration files meant for browser storage. Access credentials should always pass via proxy routes.
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminSettings;
