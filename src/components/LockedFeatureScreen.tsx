import React from 'react';
import { Lock, ShieldAlert, ArrowRight, UserCheck, Sparkles, Building2, TreePine, User } from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { ROLE_CONFIGS, DEMO_USERS } from '../constants/userData';

interface LockedFeatureScreenProps {
  featureTitle: string;
  requiredRoleName: string;
  currentUser: UserProfile;
  reason: string;
  onSwitchRole: (role: UserRole) => void;
  onNavigateAlternative?: () => void;
  alternativeTitle?: string;
}

export const LockedFeatureScreen: React.FC<LockedFeatureScreenProps> = ({
  featureTitle,
  requiredRoleName,
  currentUser,
  reason,
  onSwitchRole,
  onNavigateAlternative,
  alternativeTitle
}) => {
  const currentCfg = ROLE_CONFIGS[currentUser.role];

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 sm:p-10 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-center space-y-6">
      {/* Icon Lock Shield */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-950/60 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-500/40">
          <span>PHÂN QUYỀN HỆ THỐNG · TÍNH NĂNG BỊ KHÓA</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {featureTitle}
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          {reason}
        </p>
      </div>

      {/* Role comparison badge */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-w-lg mx-auto text-xs space-y-2 text-left">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <span className="text-slate-400">Vai trò hiện tại của bạn:</span>
          <span className={`px-2 py-0.5 rounded font-mono font-bold ${currentCfg.badgeBg} ${currentCfg.badgeBorder} ${currentCfg.badgeTextCol} border`}>
            {currentUser.name} ({currentCfg.shortTitle})
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Yêu cầu vai trò:</span>
          <span className="text-emerald-400 font-bold font-mono">
            {requiredRoleName}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => onSwitchRole('corporate')}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          <span>Chuyển sang vai trò Doanh nghiệp phát thải</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onNavigateAlternative && alternativeTitle && (
          <button
            onClick={onNavigateAlternative}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl text-xs transition-colors border border-slate-700 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span>{alternativeTitle}</span>
          </button>
        )}
      </div>

      {/* Educational note */}
      <p className="text-[11px] text-slate-400 max-w-md mx-auto">
        Hệ thống phân quyền nhằm mô phỏng chính xác khung pháp lý thị trường carbon quốc gia: chỉ các pháp nhân doanh nghiệp mới có nghĩa vụ và tài khoản giao dịch bù trừ trên sàn.
      </p>
    </div>
  );
};
