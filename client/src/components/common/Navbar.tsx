import React from 'react';
import { Shield, Smartphone, Briefcase, BarChart3, Sparkles, Wifi, WifiOff, LogOut } from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  currentMode: 'consumer' | 'inspector' | 'admin' | 'demo';
  onSelectMode: (mode: 'consumer' | 'inspector' | 'admin' | 'demo') => void;
  currentUser: User | null;
  isOnline: boolean;
  pendingSyncCount: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  currentUser,
  isOnline,
  pendingSyncCount,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Government Ribbon */}
      <div className="bg-slate-950 px-4 py-1 text-xs text-slate-400 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-amber-500">SIH26034</span>
          <span className="text-slate-500">|</span>
          <span>Ministry of Consumer Affairs, Food & Public Distribution</span>
          <span className="hidden md:inline text-slate-500">• Directorate of Legal Metrology</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1">
            {isOnline ? (
              <span className="inline-flex items-center text-emerald-400">
                <Wifi className="w-3.5 h-3.5 mr-1" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-400">
                <WifiOff className="w-3.5 h-3.5 mr-1" /> Offline Mode
              </span>
            )}
          </span>
          {pendingSyncCount > 0 && (
            <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
              {pendingSyncCount} Queued
            </span>
          )}
        </div>
      </div>

      {/* Main App Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => onSelectMode('consumer')}
          >
            <div className="bg-sky-500 p-2 rounded-lg shadow-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight text-white">LabelGuard</span>
                <span className="bg-amber-500/20 text-amber-400 text-[11px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40">
                  INDIA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wider">Scan. Understand. Verify.</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => onSelectMode('consumer')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentMode === 'consumer'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Consumer</span>
            </button>

            {['inspector', 'admin'].includes(currentUser?.role || '') && <button
              onClick={() => onSelectMode('inspector')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentMode === 'inspector'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Inspector</span>
            </button>}

            {currentUser?.role === 'admin' && <button
              onClick={() => onSelectMode('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentMode === 'admin'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin</span>
            </button>}

            <button
              onClick={() => onSelectMode('demo')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all border ${
                currentMode === 'demo'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">SIH Showcase</span>
              <span className="sm:hidden">Demo</span>
            </button>
          </nav>

          {/* User Badge */}
          {currentUser && (
            <div className="flex items-center space-x-3 pl-2 lg:pl-4 lg:border-l border-slate-800">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200">{currentUser.fullName}</div>
                <div className="text-[10px] text-slate-400 capitalize">{currentUser.role}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-sky-400 border border-slate-600">
                {currentUser.fullName.charAt(0)}
              </div>
              <button onClick={onLogout} title="Sign out" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
