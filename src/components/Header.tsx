import React from 'react';
import { 
  Leaf, Download, FileCode, Lock, LogOut, User, 
  Building2, TreePine, ShieldAlert, Sparkles, ChevronDown
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { ROLE_CONFIGS } from '../constants/userData';

export type TabType = 'calculator' | 'eco' | 'trading' | 'ai' | 'citizen' | 'forest_authority' | 'admin' | 'python';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser,
  onLogout
}) => {
  const currentRoleCfg = ROLE_CONFIGS[currentUser.role];

  const roleIcons = {
    corporate: Building2,
    forest_authority: TreePine,
    citizen: User,
    admin: ShieldAlert
  };

  const RoleIcon = roleIcons[currentUser.role];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element brand title */}
        <div 
          onClick={() => setActiveTab(currentUser.role === 'citizen' ? 'citizen' : 'calculator')} 
          className="flex items-center gap-2.5 cursor-pointer text-white font-bold text-lg tracking-tight hover:text-emerald-400 transition-colors shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Leaf className="w-4 h-4" />
          </div>
          <span>CarbonLens</span>
        </div>

        {/* Zone 2: Navigation Modules - Dynamic based on Role */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/90 p-1 rounded-2xl border border-slate-700/80 shadow-inner">
          {/* Corporate / General Tab 1 */}
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shadow-sm ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                : 'bg-slate-900 border-slate-700/70 text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
          >
            1. Tính toán phát thải
          </button>

          {/* Eco / Can Gio Tab 2 */}
          <button
            onClick={() => setActiveTab('eco')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shadow-sm ${
              activeTab === 'eco'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                : 'bg-slate-900 border-slate-700/70 text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
          >
            2. Bể chứa Cần Giờ
          </button>

          {/* Trading Hub Tab 3 - Shows Lock for Citizen */}
          <button
            onClick={() => setActiveTab('trading')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shadow-sm flex items-center gap-1 ${
              activeTab === 'trading'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                : currentUser.role === 'citizen'
                  ? 'bg-slate-900/60 border-amber-500/30 text-amber-300/80 hover:text-amber-200 hover:bg-slate-900'
                  : 'bg-slate-900 border-slate-700/70 text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
            title={currentUser.role === 'citizen' ? 'Tính năng giao dịch B2B bị khóa đối với tài khoản Cá nhân' : 'Sàn giao dịch tín chỉ carbon'}
          >
            {currentUser.role === 'citizen' && <Lock className="w-3 h-3 text-amber-400" />}
            <span>3. Sàn giao dịch</span>
            {currentUser.role === 'citizen' && <span className="text-[10px] text-amber-400 font-mono">(Khóa)</span>}
          </button>

          {/* Role-Specific Unlocked Tabs */}
          {currentUser.role === 'citizen' && (
            <button
              onClick={() => setActiveTab('citizen')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shadow-sm flex items-center gap-1.5 ${
                activeTab === 'citizen'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-950/50'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span>Dấu chân cá nhân</span>
            </button>
          )}

          {(currentUser.role === 'forest_authority' || currentUser.role === 'admin') && (
            <button
              onClick={() => setActiveTab('forest_authority')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shadow-sm flex items-center gap-1.5 ${
                activeTab === 'forest_authority'
                  ? 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-950/50'
                  : 'bg-sky-950/60 border-sky-500/40 text-sky-300 hover:bg-sky-900/60 hover:text-white'
              }`}
            >
              <TreePine className="w-3.5 h-3.5 text-sky-300" />
              <span>BQL Cần Giờ</span>
            </button>
          )}

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shadow-sm flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-950/50'
                  : 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/60 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-300" />
              <span>Quản trị Admin</span>
            </button>
          )}

          {/* AI Consultant */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
              activeTab === 'ai'
                ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-md shadow-emerald-950/50'
                : 'bg-slate-900 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>4. Cố vấn AI</span>
          </button>
        </nav>

        {/* Zone 3: Active User Role Indicator & Switch / Logout */}
        <div className="flex items-center gap-2">
          {/* Active User Chip */}
          <div 
            onClick={onLogout}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700/80 hover:border-slate-500 cursor-pointer transition-all shadow-sm"
            title="Nhấn để đổi vai trò hoặc đăng xuất"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${currentRoleCfg.badgeBg} ${currentRoleCfg.badgeBorder} ${currentRoleCfg.badgeTextCol} border`}>
              <RoleIcon className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="text-white font-bold truncate max-w-[120px]">{currentUser.name}</div>
              <div className={`text-[10px] font-mono ${currentRoleCfg.badgeTextCol}`}>{currentRoleCfg.shortTitle}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Logout button icon */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950 hover:bg-rose-950/20 transition-all shadow-sm"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
