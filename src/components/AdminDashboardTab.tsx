import React, { useState } from 'react';
import { 
  ShieldAlert, Users, Database, Settings, CheckCircle2, 
  AlertTriangle, Sliders, DollarSign, Activity, Lock, RefreshCw, 
  Eye, FileText, Check, X
} from 'lucide-react';
import { DEMO_USERS, ROLE_CONFIGS } from '../constants/userData';
import { UserRole, UserProfile } from '../types';

export const AdminDashboardTab: React.FC = () => {
  // Mock users database
  const [usersList, setUsersList] = useState<UserProfile[]>([
    DEMO_USERS.corporate,
    DEMO_USERS.forest_authority,
    DEMO_USERS.citizen,
    DEMO_USERS.admin,
    {
      id: 'usr_corp_02',
      name: 'Võ Thị Mai Phương',
      email: 'phuong.vo@saigon-port.vn',
      role: 'corporate',
      organization: 'Cảng Sài Gòn Logistics Corp',
      avatarLetter: 'P',
      title: 'Trưởng ban An toàn & Môi trường',
      joinDate: '18/02/2026',
      verified: true,
      unlockedFeatures: ROLE_CONFIGS.corporate.unlockedFeatures
    },
    {
      id: 'usr_cit_02',
      name: 'Đặng Thanh Hà',
      email: 'thanhha.dang@hcmut.edu.vn',
      role: 'citizen',
      organization: 'Đại học Bách Khoa TP.HCM',
      avatarLetter: 'H',
      title: 'Sinh viên Môi trường',
      joinDate: '25/03/2026',
      verified: false,
      unlockedFeatures: ROLE_CONFIGS.citizen.unlockedFeatures
    }
  ]);

  // System Parameters
  const [gridFactor, setGridFactor] = useState<number>(0.7221);
  const [floorPriceUSD, setFloorPriceUSD] = useState<number>(14.0);
  const [pesRatio, setPesRatio] = useState<number>(95);
  const [mrvRatio, setMrvRatio] = useState<number>(5);
  const [savedParams, setSavedParams] = useState<boolean>(false);

  const handleToggleVerify = (userId: string) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, verified: !u.verified } : u));
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole,
          unlockedFeatures: ROLE_CONFIGS[newRole].unlockedFeatures,
          title: ROLE_CONFIGS[newRole].shortTitle
        };
      }
      return u;
    }));
  };

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedParams(true);
    setTimeout(() => setSavedParams(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-950 text-purple-400 border border-purple-500/40">
                NHÓM 4 · TOÀN QUYỀN QUẢN TRỊ HỆ THỐNG (SUPER ADMIN)
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300">Quản trị & Phân quyền</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <span>Trung Tâm Kiểm Soát & Phân Quyền Quản Trị Hệ Thống</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Giám sát toàn bộ 4 nhóm tài khoản người dùng, cấu hình hệ số phát thải quốc gia (Bộ TN&MT), điều chỉnh tham số sàn giao dịch tín chỉ và thẩm tra sổ cái môi trường.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs font-mono text-purple-300 flex items-center gap-1.5 font-bold">
              <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Hệ thống Hoạt động 100% Ổn định</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Admin Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng người dùng hệ thống</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{usersList.length} tài khoản</div>
          <div className="text-[11px] text-emerald-400">4 Nhóm vai trò đã kích hoạt</div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Doanh nghiệp đã kiểm kê</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">12 đơn vị</div>
          <div className="text-[11px] text-slate-400">Tổng phát thải: 48.650 tCO2e</div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tín chỉ Blue Carbon lưu hành</span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">355.000 tCO2</div>
          <div className="text-[11px] text-slate-300">Đã tiêu hủy (Retire): 80.900 tCO2</div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng vốn điều phối Quỹ PES</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">$1.076.000</div>
          <div className="text-[11px] text-slate-300">95% chuyển cho 1.000+ hộ dân</div>
        </div>
      </div>

      {/* Main Grid: User Management & System Parameter Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Management Table (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>1. Danh Sách & Phân Quyền 4 Nhóm Người Dùng (User Roles Management)</span>
              </h3>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                Toàn quyền sửa
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-2.5 font-semibold">Người Dùng & Đơn Vị</th>
                    <th className="pb-2.5 font-semibold">Nhóm Vai Trò (Role)</th>
                    <th className="pb-2.5 font-semibold text-center">Xác Thực</th>
                    <th className="pb-2.5 font-semibold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {usersList.map((u) => {
                    const cfg = ROLE_CONFIGS[u.role];
                    return (
                      <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({u.id})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{u.organization}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                        </td>

                        <td className="py-3 px-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="corporate">1. Doanh nghiệp (Corporate)</option>
                            <option value="forest_authority">2. Chủ rừng Cần Giờ (Forest)</option>
                            <option value="citizen">3. Cá nhân (Citizen)</option>
                            <option value="admin">4. Quản trị viên (Admin)</option>
                          </select>
                        </td>

                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleToggleVerify(u.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                              u.verified 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {u.verified ? 'Đã duyệt' : 'Chưa duyệt'}
                          </button>
                        </td>

                        <td className="py-3 pl-2 text-right">
                          <button
                            onClick={() => alert(`Chi tiết quyền hạn của ${u.name}:\n- ${u.unlockedFeatures.join('\n- ')}`)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
                          >
                            Xem quyền
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: System Parameters (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <span>2. Cấu Hình Tham Số Hệ Thống</span>
              </h3>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                Toàn cục
              </span>
            </div>

            {savedParams && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Đã lưu và áp dụng tham số mới cho toàn bộ máy tính toán!</span>
              </div>
            )}

            <form onSubmit={handleSaveParams} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Hệ số phát thải lưới điện quốc gia (kg CO2/kWh)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={gridFactor}
                  onChange={(e) => setGridFactor(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Quyết định Bộ TN&MT (2022: 0.7221 kg/kWh)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Giá sàn tín chỉ Blue Carbon tối thiểu ($/tCO2)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={floorPriceUSD}
                  onChange={(e) => setFloorPriceUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Bảo đảm giá trị đầu tư bảo tồn sinh quyển Cần Giờ
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Tỷ lệ Quỹ PES (%)
                  </label>
                  <input
                    type="number"
                    value={pesRatio}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPesRatio(val);
                      setMrvRatio(100 - val);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-emerald-400">1.000+ Hộ giữ rừng</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Tỷ lệ MRV (%)
                  </label>
                  <input
                    type="number"
                    value={mrvRatio}
                    disabled
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono"
                  />
                  <span className="text-[10px] text-sky-400">Tháp đo viễn thám</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Cập Nhật Tham Số Toàn Hệ Thống</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
