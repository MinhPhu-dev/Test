import React, { useState } from 'react';
import { 
  TreePine, Layers, PlusCircle, CheckCircle2, TrendingUp, 
  DollarSign, Users, ShieldCheck, Database, Calendar, MapPin, 
  FileCheck2, AlertCircle, RefreshCw, Sparkles
} from 'lucide-react';
import { CAN_GIO_ZONES } from '../constants/scienceData';

interface ForestCreditBatch {
  id: string;
  vintage: number;
  batchName: string;
  standard: string;
  issuedTons: number;
  availableTons: number;
  pricePerTonUSD: number;
  issueDate: string;
  verifier: string;
  status: 'active' | 'auditing' | 'retired';
}

export const ForestAuthorityTab: React.FC = () => {
  // Forest Zones biomass local state
  const [zones, setZones] = useState(CAN_GIO_ZONES);
  const [editingZoneIndex, setEditingZoneIndex] = useState<number | null>(null);
  const [tempDensity, setTempDensity] = useState<number>(0);

  // Credit Issuance state
  const [batches, setBatches] = useState<ForestCreditBatch[]>([
    {
      id: 'CG-BLU-2026-A1',
      vintage: 2026,
      batchName: 'Đợt 1 - Trầm tích Phân khu Bảo vệ Nghiêm ngặt Tam Thôn Hiệp',
      standard: 'Verra VCS (VM0033 Tidal Wetland Restoration)',
      issuedTons: 150000,
      availableTons: 62500,
      pricePerTonUSD: 14.5,
      issueDate: '15/01/2026',
      verifier: 'Hội đồng Khoa học Sinh quyển Cần Giờ & SGS Vietnam',
      status: 'active'
    },
    {
      id: 'CG-BLU-2025-B4',
      vintage: 2025,
      batchName: 'Đợt 4 - Rừng Đước đôi bãi bồi ven sông Lòng Tàu',
      standard: 'Plan Vivo Blue Carbon Standard',
      issuedTons: 120000,
      availableTons: 18400,
      pricePerTonUSD: 13.0,
      issueDate: '10/11/2025',
      verifier: 'Viện Sinh thái & Tài nguyên Sinh vật TP.HCM',
      status: 'active'
    },
    {
      id: 'CG-BLU-2026-C2',
      vintage: 2026,
      batchName: 'Đợt 2 - Quần thể Mắm trắng ven biển Cần Thạnh & Long Hòa',
      standard: 'TCVN 13324:2025 Kiểm kê Blue Carbon',
      issuedTons: 85000,
      availableTons: 85000,
      pricePerTonUSD: 15.0,
      issueDate: '20/03/2026',
      verifier: 'Ban Quản Lý Khu Dự Trữ Sinh Quyển Cần Giờ',
      status: 'auditing'
    }
  ]);

  // Form to issue new batch
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchStandard, setNewBatchStandard] = useState('Verra VCS (VM0033 Tidal Wetland Restoration)');
  const [newBatchTons, setNewBatchTons] = useState<number>(50000);
  const [newBatchPrice, setNewBatchPrice] = useState<number>(15.0);
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState(false);

  // Financial PES statistics
  const totalIssued = batches.reduce((sum, b) => sum + b.issuedTons, 0);
  const totalSold = batches.reduce((sum, b) => sum + (b.issuedTons - b.availableTons), 0);
  const totalRevenueUSD = totalSold * 14.0;
  const pesFund95USD = totalRevenueUSD * 0.95;
  const mrvFund5USD = totalRevenueUSD * 0.05;

  const handleStartEditZone = (index: number) => {
    setEditingZoneIndex(index);
    setTempDensity(zones[index].carbonDensityTonPerHa);
  };

  const handleSaveZone = (index: number) => {
    const updated = [...zones];
    updated[index] = {
      ...updated[index],
      carbonDensityTonPerHa: tempDensity
    };
    setZones(updated);
    setEditingZoneIndex(null);
  };

  const handleIssueBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName || newBatchTons <= 0) return;

    setIsIssuing(true);
    setTimeout(() => {
      const created: ForestCreditBatch = {
        id: `CG-BLU-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        vintage: new Date().getFullYear(),
        batchName: newBatchName,
        standard: newBatchStandard,
        issuedTons: newBatchTons,
        availableTons: newBatchTons,
        pricePerTonUSD: newBatchPrice,
        issueDate: new Date().toLocaleDateString('vi-VN'),
        verifier: 'Ban Quản Lý Khu DTSQ Cần Giờ & Viện Nghiên cứu Rừng Ngập Mặn',
        status: 'active'
      };

      setBatches([created, ...batches]);
      setIsIssuing(false);
      setIssueSuccess(true);
      setNewBatchName('');
      setNewBatchTons(50000);
      setTimeout(() => setIssueSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-500/40">
                PHÍA CUNG (SUPPLY SIDE) · BQL KHU DTSQ CẦN GIỜ
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300">Quản lý Bể chứa & Phát hành Tín chỉ</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <TreePine className="w-5 h-5 text-sky-400" />
              <span>Bảng Điều Khiển Chủ Rừng Sinh Quyển Rừng Ngập Mặn Cần Giờ</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Cập nhật dữ liệu đo đạc thực địa sinh khối trên 35.120 ha rừng, thẩm định lô tín chỉ phát hành và điều phối nguồn thu Dịch vụ Môi trường Rừng (PES) đến 1.000+ hộ dân bảo vệ rừng.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>MRV Vệ tinh Sentinel-2 Đang kết nối</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Overview 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng diện tích bảo tồn</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">35.120 ha</div>
          <div className="text-[11px] text-emerald-400 font-medium">100% Thuộc Khu DTSQ Thế giới</div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tín chỉ đã phát hành</span>
            <FileCheck2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {totalIssued.toLocaleString('vi-VN')} <span className="text-xs text-slate-400">tCO2e</span>
          </div>
          <div className="text-[11px] text-slate-300">Đã bán: {totalSold.toLocaleString('vi-VN')} tCO2e</div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Quỹ chi trả PES (95%)</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            ${(pesFund95USD / 1000).toFixed(0)}k <span className="text-xs text-slate-400">USD</span>
          </div>
          <div className="text-[11px] text-slate-300">Giải ngân cho 1.000+ hộ giữ rừng</div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Quỹ MRV & Viễn thám (5%)</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            ${(mrvFund5USD / 1000).toFixed(1)}k <span className="text-xs text-slate-400">USD</span>
          </div>
          <div className="text-[11px] text-slate-300">Duy trì trạm tháp đo CO2 & Drone</div>
        </div>
      </div>

      {/* Main Grid: Zone Biomass Editor & Credit Issuance Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Forest Biomass Zone Live Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>1. Cập Nhật Mật Độ Sinh Khối & Trữ Lượng Carbon 4 Phân Khu</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  BQL có quyền hiệu chỉnh chỉ số carbon thực tế dựa trên báo cáo thực địa định kỳ
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                Thực địa 2026
              </span>
            </div>

            <div className="space-y-3">
              {zones.map((zone, idx) => {
                const isEditing = editingZoneIndex === idx;
                const totalZoneCarbon = zone.areaHa * zone.carbonDensityTonPerHa;

                return (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{zone.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800">
                            {zone.areaHa.toLocaleString('vi-VN')} ha
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Loài ưu thế: <span className="text-slate-200">{zone.dominantSpecies}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-emerald-400">
                            {zone.carbonDensityTonPerHa} <span className="text-[10px] text-slate-400">tCO2/ha</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Tổng: {(totalZoneCarbon / 1000).toFixed(1)}k tCO2
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="5"
                              value={tempDensity}
                              onChange={(e) => setTempDensity(Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-900 border border-emerald-500 rounded text-xs text-white font-mono"
                            />
                            <button
                              onClick={() => handleSaveZone(idx)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingZoneIndex(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 hover:text-white rounded text-xs"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditZone(idx)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                          >
                            Hiệu chỉnh
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-900">
                      {zone.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Issue New Batch Form & History (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Issue form */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-sky-400" />
                <span>2. Phát Hành Đợt Tín Chỉ Mới (Issuance)</span>
              </h3>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-500/30">
                Thẩm định bên thứ ba
              </span>
            </div>

            {issueSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Phát hành đợt tín chỉ thành công! Dữ liệu đã đồng bộ lên Sàn giao dịch mô phỏng.</span>
              </div>
            )}

            <form onSubmit={handleIssueBatch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Tên Lô / Phân đoạn phát hành
                </label>
                <input
                  type="text"
                  required
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="ví dụ: Đợt 3 - Khu phục hồi sinh thái An Thới Đông"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Tiêu chuẩn Thẩm định & Xác thực
                </label>
                <select
                  value={newBatchStandard}
                  onChange={(e) => setNewBatchStandard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Verra VCS (VM0033 Tidal Wetland Restoration)">Verra VCS (VM0033 Tidal Wetland Restoration)</option>
                  <option value="Plan Vivo Blue Carbon Standard">Plan Vivo Blue Carbon Standard</option>
                  <option value="Gold Standard Land Use & Forestry">Gold Standard Land Use & Forestry</option>
                  <option value="TCVN 13324:2025 Kiểm kê Blue Carbon Cần Giờ">TCVN 13324:2025 Kiểm kê Blue Carbon Cần Giờ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Khối lượng phát hành (tCO2e)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="1000"
                    value={newBatchTons}
                    onChange={(e) => setNewBatchTons(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Giá sàn đề xuất ($/tCO2)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    value={newBatchPrice}
                    onChange={(e) => setNewBatchPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                Tất cả tín chỉ phát hành đều được cấp mã chuỗi khối Registry duy nhất, cam kết không xảy ra tính trùng (Double Counting) và ưu tiên bảo đảm sinh kế 1.000+ hộ dân Cần Giờ.
              </div>

              <button
                type="submit"
                disabled={isIssuing}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isIssuing ? 'Đang thẩm định & tạo mã...' : 'Phát Hành Lô Tín Chỉ Mới Lên Sàn'}</span>
              </button>
            </form>
          </div>

          {/* Current Batches List */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Danh Sách Đợt Tín Chỉ Đang Lưu Hành</span>
            </h4>

            <div className="space-y-2.5">
              {batches.map((b) => (
                <div key={b.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-sky-400">{b.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    }`}>
                      {b.status === 'active' ? 'Đang mở bán' : 'Đang hậu kiểm'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{b.batchName}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                    <span>Còn lại: {b.availableTons.toLocaleString('vi-VN')} / {b.issuedTons.toLocaleString('vi-VN')} t</span>
                    <span className="text-emerald-400 font-bold">${b.pricePerTonUSD}/t</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
