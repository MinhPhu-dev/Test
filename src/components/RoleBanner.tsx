import React from 'react';
import { 
  Building2, TreePine, User, ShieldAlert, Sparkles, 
  ChevronRight, LogIn, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { ROLE_CONFIGS, DEMO_USERS } from '../constants/userData';

interface RoleBannerProps {
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({
  currentUser,
  onOpenAuth,
  onSelectRole
}) => {
  const currentConfig = ROLE_CONFIGS[currentUser.role];

  const roleIcons = {
    corporate: Building2,
    forest_authority: TreePine,
    citizen: User,
    admin: ShieldAlert
  };

  const Icon = roleIcons[currentUser.role];

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-xs">
          {/* User ID & Role status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${currentConfig.badgeBg} ${currentConfig.badgeBorder} ${currentConfig.badgeTextCol}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold">{currentUser.name}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-300 truncate max-w-[200px] sm:max-w-xs">{currentUser.organization}</span>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-xl font-bold font-mono text-[11px] border flex items-center gap-1.5 ${currentConfig.badgeBg} ${currentConfig.badgeBorder} ${currentConfig.badgeTextCol}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              <span>{currentConfig.badgeText}</span>
            </span>

            <span className="hidden sm:inline-block text-slate-400 text-[11px]">
              {currentConfig.purpose}
            </span>
          </div>

          {/* Quick 1-click Role Switcher Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chuyển vai trò:</span>
            </span>

            {(['corporate', 'forest_authority', 'citizen', 'admin'] as UserRole[]).map((r) => {
              const cfg = ROLE_CONFIGS[r];
              const isSelected = currentUser.role === r;

              return (
                <button
                  key={r}
                  onClick={() => onSelectRole(r)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm ring-1 ring-emerald-400/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`Chuyển sang ${cfg.title}`}
                >
                  <span>{cfg.shortTitle}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
              );
            })}

            <button
              onClick={onOpenAuth}
              className="ml-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap transition-colors"
              title="Đăng nhập / Đăng ký tài khoản khác"
            >
              <LogIn className="w-3 h-3" />
              <span>Tài khoản...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
