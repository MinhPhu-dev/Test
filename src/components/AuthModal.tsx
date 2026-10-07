import React, { useState } from 'react';
import { 
  X, ShieldCheck, Building2, TreePine, User, ShieldAlert, 
  CheckCircle2, ArrowRight, Sparkles, LogIn, UserPlus, KeyRound, Mail
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { DEMO_USERS, ROLE_CONFIGS } from '../constants/userData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser
}) => {
  const [activeTab, setActiveTab] = useState<'quick_roles' | 'custom_login' | 'register'>('quick_roles');
  
  // Custom login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('corporate');

  if (!isOpen) return null;

  const handleQuickLogin = (role: UserRole) => {
    onSelectUser(DEMO_USERS[role]);
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to corporate or match existing demo user
    const matchedRole: UserRole = email.includes('admin') 
      ? 'admin' 
      : email.includes('cangio') || email.includes('forest')
        ? 'forest_authority'
        : email.includes('citizen') || email.includes('nam')
          ? 'citizen'
          : 'corporate';

    const baseUser = DEMO_USERS[matchedRole];
    onSelectUser({
      ...baseUser,
      email: email || baseUser.email,
      name: email.split('@')[0] || baseUser.name
    });
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: regName || 'Người dùng mới',
      email: regEmail || 'user@carbonlens.vn',
      role: regRole,
      organization: regOrg || 'Đơn vị thành viên',
      avatarLetter: (regName || 'U').charAt(0).toUpperCase(),
      title: ROLE_CONFIGS[regRole].shortTitle,
      joinDate: new Date().toLocaleDateString('vi-VN'),
      verified: true,
      unlockedFeatures: ROLE_CONFIGS[regRole].unlockedFeatures
    };
    onSelectUser(newUser);
    onClose();
  };

  const roleIcons = {
    corporate: Building2,
    forest_authority: TreePine,
    citizen: User,
    admin: ShieldAlert
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Cổng Đăng Nhập & Phân Quyền Người Dùng</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  4 NHÓM
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Lựa chọn nhóm tài khoản để mở khóa các phân hệ chức năng tương ứng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('quick_roles')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all text-center border ${
              activeTab === 'quick_roles'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/40'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>1. Trải nghiệm nhanh 4 Vai trò (Khuyên dùng)</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('custom_login')}
            className={`py-2 px-4 rounded-xl font-medium transition-all text-center border ${
              activeTab === 'custom_login'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập Email</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`py-2 px-4 rounded-xl font-medium transition-all text-center border ${
              activeTab === 'register'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <UserPlus className="w-4 h-4" />
              <span>Đăng ký mới</span>
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {activeTab === 'quick_roles' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>Chọn 1 trong 4 nhóm tài khoản dưới đây để đăng nhập tức thì và mở khóa các tính năng:</span>
                <span className="font-mono text-emerald-400 font-bold">1-Click Login</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(['corporate', 'forest_authority', 'citizen', 'admin'] as UserRole[]).map((role) => {
                  const cfg = ROLE_CONFIGS[role];
                  const demoUser = DEMO_USERS[role];
                  const Icon = roleIcons[role];
                  const isCurrent = currentUser.role === role;

                  return (
                    <div
                      key={role}
                      className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div>
                        {/* Header card */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeTextCol}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-white leading-tight">
                                {cfg.shortTitle}
                              </h3>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border inline-block mt-0.5 ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeTextCol}`}>
                                {cfg.badgeText}
                              </span>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Đang dùng
                            </span>
                          )}
                        </div>

                        {/* Demo user info */}
                        <div className="text-[11px] text-slate-300 py-1.5 border-t border-b border-slate-800/80 my-2 space-y-0.5">
                          <div className="text-white font-semibold truncate">{demoUser.name}</div>
                          <div className="text-slate-400 truncate text-[10px]">{demoUser.organization}</div>
                        </div>

                        {/* Purpose */}
                        <p className="text-[11px] text-slate-300 italic mb-2 leading-relaxed">
                          "{cfg.purpose}"
                        </p>

                        {/* Unlocked Features List */}
                        <div className="space-y-1 mb-3">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Tính năng được mở khóa:
                          </div>
                          {cfg.unlockedFeatures.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                              <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                              <span className="leading-tight">{feat}</span>
                            </div>
                          ))}
                          {cfg.unlockedFeatures.length > 3 && (
                            <div className="text-[10px] text-slate-400 italic">
                              + {cfg.unlockedFeatures.length - 3} tính năng nâng cao khác...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Login Button */}
                      <button
                        onClick={() => handleQuickLogin(role)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isCurrent
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        <span>{isCurrent ? 'Tiếp tục vai trò này' : `Đăng nhập vai trò ${cfg.shortTitle}`}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'custom_login' && (
            <form onSubmit={handleCustomLogin} className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center space-y-1 mb-4">
                <h3 className="text-sm font-bold text-white">Đăng Nhập Tài Khoản Thành Viên</h3>
                <p className="text-xs text-slate-400">Nhập email của bạn để hệ thống tự động nhận diện vai trò</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ví dụ: tuan.nguyen@doanhnghiep.vn"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Mẹo: Nhập email có chứa "admin", "cangio", "citizen" để trải nghiệm vai trò tương ứng.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Mật khẩu</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Vào Hệ Thống</span>
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 max-w-lg mx-auto py-2">
              <div className="text-center space-y-1 mb-2">
                <h3 className="text-sm font-bold text-white">Đăng Ký Tài Khoản Mới</h3>
                <p className="text-xs text-slate-400">Chọn nhóm người dùng phù hợp với nhu cầu của bạn</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Email liên hệ</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@tochuc.vn"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Tên Cơ quan / Doanh nghiệp / Đơn vị</label>
                <input
                  type="text"
                  required
                  value={regOrg}
                  onChange={(e) => setRegOrg(e.target.value)}
                  placeholder="Công ty CP Xanh Á Châu hoặc Cá nhân độc lập"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Chọn Nhóm Người Dùng (User Role)</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="corporate">Nhóm 1: Doanh nghiệp phát thải (Emitter / Corporate User)</option>
                  <option value="forest_authority">Nhóm 2: Đơn vị quản lý / Chủ rừng sinh quyển Cần Giờ</option>
                  <option value="citizen">Nhóm 3: Người tiêu dùng thông thường / Cá nhân</option>
                  <option value="admin">Nhóm 4: Quản trị viên hệ thống (Admin)</option>
                </select>
                <div className="text-[11px] text-emerald-400 mt-1.5 p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <b>Quyền hạn sẽ được cấp:</b> {ROLE_CONFIGS[regRole].purpose}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Hoàn Tất Đăng Ký & Khởi Tạo Phân Quyền</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
