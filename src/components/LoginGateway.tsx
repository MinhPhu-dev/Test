import React, { useState } from 'react';
import { 
  Building2, TreePine, User, ShieldAlert, Sparkles, 
  ArrowRight, ShieldCheck, CheckCircle2, Lock, LogIn, Mail, KeyRound, Globe, FileSpreadsheet
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { ROLE_CONFIGS, DEMO_USERS } from '../constants/userData';

interface LoginGatewayProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('corporate');
  const [showCustomLogin, setShowCustomLogin] = useState<boolean>(false);
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customPassword, setCustomPassword] = useState<string>('');

  const roleIcons = {
    corporate: Building2,
    forest_authority: TreePine,
    citizen: User,
    admin: ShieldAlert
  };

  const handleSelectRoleLogin = (role: UserRole) => {
    onLogin(DEMO_USERS[role]);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedRole: UserRole = customEmail.includes('admin') 
      ? 'admin' 
      : customEmail.includes('cangio') || customEmail.includes('forest')
        ? 'forest_authority'
        : customEmail.includes('citizen') || customEmail.includes('nam')
          ? 'citizen'
          : 'corporate';

    const base = DEMO_USERS[matchedRole];
    onLogin({
      ...base,
      name: customEmail.split('@')[0] || base.name,
      email: customEmail || base.email
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar Branding */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/40">
            <TreePine className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>CarbonLens</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v2.6 Enterprise
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Nền tảng Kiểm kê Phát thải & Sàn Giao dịch Blue Carbon Cần Giờ
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Khu DTSQ Rừng Ngập Mặn Cần Giờ · UNESCO</span>
          </span>
          <button
            onClick={() => setShowCustomLogin(!showCustomLogin)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{showCustomLogin ? 'Xem 4 Vai trò' : 'Đăng nhập Email'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {!showCustomLogin ? (
          <div className="space-y-8">
            {/* Hero Introduction */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Chọn Vai Trò Để Bắt Đầu Trải Nghiệm Nền Tảng
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Hệ thống tự động mở khóa các công cụ chuyên biệt tùy theo nhóm tài khoản bạn lựa chọn. Bạn có thể chuyển đổi linh hoạt vai trò bất cứ lúc nào trên thanh điều hướng.
              </p>
            </div>

            {/* 4 User Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {(['corporate', 'forest_authority', 'citizen', 'admin'] as UserRole[]).map((role) => {
                const cfg = ROLE_CONFIGS[role];
                const demoUser = DEMO_USERS[role];
                const Icon = roleIcons[role];

                // Role-specific border colors
                const borderHover = role === 'corporate' 
                  ? 'hover:border-emerald-500/80' 
                  : role === 'forest_authority' 
                    ? 'hover:border-sky-500/80' 
                    : role === 'citizen' 
                      ? 'hover:border-amber-500/80' 
                      : 'hover:border-purple-500/80';

                const buttonColor = role === 'corporate' 
                  ? 'bg-emerald-600 hover:bg-emerald-500' 
                  : role === 'forest_authority' 
                    ? 'bg-sky-600 hover:bg-sky-500' 
                    : role === 'citizen' 
                      ? 'bg-amber-600 hover:bg-amber-500' 
                      : 'bg-purple-600 hover:bg-purple-500';

                return (
                  <div
                    key={role}
                    className={`bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-xl ${borderHover} hover:shadow-2xl hover:-translate-y-1 group`}
                  >
                    <div>
                      {/* Role Header Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeTextCol}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeTextCol}`}>
                          {cfg.badgeText}
                        </span>
                      </div>

                      {/* Role Title */}
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {cfg.shortTitle}
                      </h3>

                      {/* Purpose */}
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed italic border-l-2 border-slate-700 pl-2">
                        "{cfg.purpose}"
                      </p>

                      {/* Demo User Info */}
                      <div className="my-3.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-0.5">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          Tài khoản trải nghiệm mẫu:
                        </div>
                        <div className="font-bold text-white truncate">{demoUser.name}</div>
                        <div className="text-slate-400 text-[11px] truncate">{demoUser.title}</div>
                        <div className="text-slate-500 text-[10px] font-mono truncate">{demoUser.organization}</div>
                      </div>

                      {/* Unlocked Features */}
                      <div className="space-y-1.5 mb-5">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Quyền hạn & Tính năng:
                        </div>
                        {cfg.unlockedFeatures.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}
                        {role === 'citizen' && (
                          <div className="flex items-start gap-1.5 text-xs text-amber-400 font-medium">
                            <span className="text-amber-400 font-bold shrink-0 mt-0.5">🔒</span>
                            <span className="leading-snug">Khóa sàn mua tín chỉ carbon B2B</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectRoleLogin(role)}
                      className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${buttonColor}`}
                    >
                      <span>Đăng nhập với vai trò này</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Custom Email / Password Login Form */
          <div className="max-w-md w-full mx-auto bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Đăng Nhập Tài Khoản Thành Viên</h2>
              <p className="text-xs text-slate-400">
                Nhập thông tin xác thực để hệ thống tự động tải quyền hạn của bạn
              </p>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Email công vụ / Doanh nghiệp / Cá nhân
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="ví dụ: tuan.nguyen@doanhnghiep.vn"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Mật khẩu bảo mật
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Tự động nhận diện quyền theo tên miền:</div>
                <div>• Chứa <code className="text-purple-400">admin</code>: Vào giao diện Quản trị viên</div>
                <div>• Chứa <code className="text-sky-400">cangio</code> hoặc <code className="text-sky-400">forest</code>: Vào BQL Cần Giờ</div>
                <div>• Chứa <code className="text-amber-400">citizen</code> hoặc <code className="text-amber-400">nam</code>: Vào vai trò Cá nhân</div>
                <div>• Còn lại: Vào vai trò Doanh nghiệp phát thải (Scope 1 & 2)</div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Xác Nhận Đăng Nhập</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCustomLogin(false)}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Quay lại lựa chọn 4 vai trò nhanh
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400 bg-slate-900/50">
        <p>
          Hệ thống Kiểm kê Phát thải & Sàn Giao dịch Tín chỉ Blue Carbon Rừng Ngập Mặn Cần Giờ © 2026. Chuẩn GHG Protocol & IPCC.
        </p>
      </footer>
    </div>
  );
};
