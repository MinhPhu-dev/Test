import React, { useState } from 'react';
import { 
  TreePine, Waves, Compass, Layers, ShieldCheck, 
  TrendingUp, Info, MapPin, Eye, Workflow
} from 'lucide-react';
import { CAN_GIO_ECO_METRICS, CAN_GIO_ZONES } from '../constants/scienceData';
import { ReverseLogisticsMap } from './ReverseLogisticsMap';

export const EcoDashboardTab: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'all' | 'baseline' | 'enhanced' | 'vulnerable'>('all');
  const [forecastYear, setForecastYear] = useState<number>(2030);

  // Mangrove image asset
  const mangroveImg = 'cangio_mangrove_forest_1790662934230.jpg';

  // Projection logic
  const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
  
  const getAbsorption = (year: number, scenario: 'baseline' | 'enhanced' | 'vulnerable') => {
    const i = year - 2026;
    if (scenario === 'baseline') {
      return 650000 + i * 8500;
    }
    if (scenario === 'enhanced') {
      return 650000 + i * 24000 + Math.pow(i, 1.2) * 3500;
    }
    return 650000 + i * 2000 - Math.pow(i, 1.4) * 2200;
  };

  const currentYearIdx = forecastYear - 2026;
  const currentBaseline = getAbsorption(forecastYear, 'baseline');
  const currentEnhanced = getAbsorption(forecastYear, 'enhanced');
  const currentVulnerable = getAbsorption(forecastYear, 'vulnerable');

  // Chart max value for scaling
  const maxVal = 950000;
  const minVal = 600000;

  return (
    <div className="space-y-6">
      {/* Quick Jump Anchor Bar for Section 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-700/80 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="#eco-overview"
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            <TreePine className="w-4 h-4 text-emerald-400" />
            <span>1. Sinh Khối & Dự Báo 2026-2035</span>
          </a>
          <a
            href="#reverse-logistics-section"
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl border border-emerald-500/50 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 hover:text-white transition-all shadow-sm"
          >
            <Workflow className="w-4 h-4 text-emerald-400" />
            <span>2. Sơ Đồ Chuỗi Cung Ứng Ngược (Reverse Logistics)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              TRỰC QUAN
            </span>
          </a>
        </div>
        <div className="text-xs text-slate-300 font-mono hidden lg:flex items-center gap-1.5 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>UNESCO Biosphere Reserve · Cần Giờ Blue Carbon Registry</span>
        </div>
      </div>

      {/* Hero Banner with Can Gio Mangrove Imagery */}
      <div id="eco-overview" className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-900 scroll-mt-24">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={mangroveImg}
            alt="Khu dự trữ sinh quyển Rừng ngập mặn Cần Giờ"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-90 hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              // fallback gradient container if image fails
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Cần Giờ, TP. Hồ Chí Minh</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Khu Dự trữ Sinh quyển Thế giới UNESCO (2000)</span>
            <span aria-hidden="true">·</span>
            <span>Bể Lưu Trữ Blue Carbon Quốc Gia</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Giám Sát Bể Chứa Sinh Khối & Tín Chỉ Rừng Ngập Mặn Cần Giờ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            Hệ sinh thái rừng ngập mặn Cần Giờ lưu giữ carbon xanh (Blue Carbon) với mật độ vượt trội gấp 4–6 lần rừng nhiệt đới trên cạn,
            nhờ lớp trầm tích bùn yếm khí giữ carbon an toàn qua hàng thế kỷ.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards (4-column grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Rừng phòng hộ</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {CAN_GIO_ECO_METRICS.protectedMangroveAreaHa.toLocaleString('vi-VN')}
            <span className="text-xs text-slate-400 ml-1 font-normal">ha</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Trên tổng số {CAN_GIO_ECO_METRICS.totalBiosphereAreaHa.toLocaleString()} ha tự nhiên
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Hệ số hấp thụ</span>
            <Waves className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums">
            {CAN_GIO_ECO_METRICS.averageAbsorptionRate}
            <span className="text-xs text-slate-400 ml-1 font-normal">tCO2/ha/năm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Hiệu suất Blue Carbon ngập mặn
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Hấp thụ hàng năm</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {CAN_GIO_ECO_METRICS.annualTotalAbsorptionTon.toLocaleString('vi-VN')}
            <span className="text-xs text-slate-400 ml-1 font-normal">tCO2/năm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Sản lượng tín chỉ sinh học tiềm năng
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Bể tích lũy lũy kế</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            ~17.85
            <span className="text-xs text-slate-400 ml-1 font-normal">Triệu tCO2</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Tổng trữ lượng lưu giữ sinh thái
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Carbon Pools Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Cấu Trúc Bể Chứa Carbon (Carbon Pools)</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Blue Carbon</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-200 font-medium">Trầm tích hữu cơ xanh (Soil Organic Carbon)</span>
                  <span className="text-emerald-400 font-bold font-mono">62.5% · ~11.16M tCO2</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '62.5%' }}></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lớp bùn yếm khí sâu 1-3m, lưu trữ carbon lâu dài không bị phân hủy hiếu khí.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-200 font-medium">Sinh khối trên mặt đất (AGB - Thân, Cành, Lá)</span>
                  <span className="text-teal-400 font-bold font-mono">23.0% · ~4.11M tCO2</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '23.0%' }}></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Rừng Đước đôi, Mấm trắng và Bần với mật độ tán dày đặc qua hơn 45 năm phục hồi.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-200 font-medium">Sinh khối rễ ngập triều (BGB - Rễ chống/thở)</span>
                  <span className="text-blue-400 font-bold font-mono">11.5% · ~2.05M tCO2</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '11.5%' }}></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mạng lưới rễ chống chân nôm đan xen giữ phù sa và bẫy vật chất hữu cơ trôi nổi.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-200 font-medium">Vật rơi rụng & Gỗ mục (Litter & Deadwood)</span>
                  <span className="text-slate-400 font-bold font-mono">3.0% · ~0.53M tCO2</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full" style={{ width: '3.0%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 leading-relaxed">
              <span className="font-semibold">💡 Ý nghĩa Kinh tế tuần hoàn:</span> Rừng Cần Giờ là bể ngấm carbon (Carbon Sink) đóng vai trò trung tâm tạo nguồn tín chỉ bù trừ cho các trung tâm phát thải công nghiệp lớn tại TP.HCM và vùng kinh tế trọng điểm phía Nam.
            </div>
          </div>
        </div>

        {/* Right: Multi-scenario Forecast Interactive Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Dự Báo Năng Lực Hấp Thụ CO2 (Giai đoạn 2026 - 2035)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mô phỏng 3 kịch bản can thiệp lâm sinh & quản lý rừng ngập mặn
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setSelectedScenario('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${selectedScenario === 'all' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setSelectedScenario('baseline')}
                  className={`px-2.5 py-1 rounded transition-colors ${selectedScenario === 'baseline' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                >
                  Chuẩn
                </button>
                <button
                  onClick={() => setSelectedScenario('enhanced')}
                  className={`px-2.5 py-1 rounded transition-colors ${selectedScenario === 'enhanced' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                >
                  Phục hồi
                </button>
                <button
                  onClick={() => setSelectedScenario('vulnerable')}
                  className={`px-2.5 py-1 rounded transition-colors ${selectedScenario === 'vulnerable' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                >
                  Rủi ro BĐKH
                </button>
              </div>
            </div>

            {/* Interactive SVG Projection Chart */}
            <div className="space-y-2">
              <div className="h-60 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200].map((y) => (
                    <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
                  ))}

                  {/* Kịch bản 1: Baseline (Blue) */}
                  {(selectedScenario === 'all' || selectedScenario === 'baseline') && (
                    <polyline
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      points={years
                        .map((yr, idx) => {
                          const x = (idx / (years.length - 1)) * 500;
                          const val = getAbsorption(yr, 'baseline');
                          const y = 200 - ((val - minVal) / (maxVal - minVal)) * 200;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Kịch bản 2: Enhanced (Emerald) */}
                  {(selectedScenario === 'all' || selectedScenario === 'enhanced') && (
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      points={years
                        .map((yr, idx) => {
                          const x = (idx / (years.length - 1)) * 500;
                          const val = getAbsorption(yr, 'enhanced');
                          const y = 200 - ((val - minVal) / (maxVal - minVal)) * 200;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Kịch bản 3: Vulnerable (Rose) */}
                  {(selectedScenario === 'all' || selectedScenario === 'vulnerable') && (
                    <polyline
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      points={years
                        .map((yr, idx) => {
                          const x = (idx / (years.length - 1)) * 500;
                          const val = getAbsorption(yr, 'vulnerable');
                          const y = 200 - ((val - minVal) / (maxVal - minVal)) * 200;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Year marker line */}
                  <line
                    x1={(currentYearIdx / (years.length - 1)) * 500}
                    y1="0"
                    x2={(currentYearIdx / (years.length - 1)) * 500}
                    y2="200"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                {years.map((y) => (
                  <span 
                    key={y} 
                    onClick={() => setForecastYear(y)}
                    className={`cursor-pointer transition-colors ${forecastYear === y ? 'text-amber-400 font-bold' : 'hover:text-white'}`}
                  >
                    {y}
                  </span>
                ))}
              </div>
            </div>

            {/* Year Inspector details */}
            <div className="bg-slate-900/80 rounded-lg p-3.5 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Dự báo chỉ số hấp thụ tại mốc năm <b className="text-amber-400 font-mono">{forecastYear}</b>:
                </span>
                <span className="text-[11px] text-slate-400">Kéo thanh chọn mốc:</span>
              </div>

              <input
                type="range"
                min="2026"
                max="2035"
                step="1"
                value={forecastYear}
                onChange={(e) => setForecastYear(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 mb-3"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded border-l-2 border-blue-400">
                  <div className="text-slate-400 text-[11px]">1. Hiện trạng (Baseline)</div>
                  <div className="text-white font-mono font-bold text-sm mt-0.5">
                    {currentBaseline.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} tCO2
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded border-l-2 border-emerald-400">
                  <div className="text-slate-400 text-[11px]">2. Phục hồi tăng cường</div>
                  <div className="text-emerald-400 font-mono font-bold text-sm mt-0.5">
                    {currentEnhanced.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} tCO2
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded border-l-2 border-rose-400">
                  <div className="text-slate-400 text-[11px]">3. Rủi ro BĐKH & Xâm thực</div>
                  <div className="text-rose-400 font-mono font-bold text-sm mt-0.5">
                    {currentVulnerable.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} tCO2
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Can Gio Subzone Ecological Table */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Phân Bố Không Gian Sinh Thái & Mật Độ Trữ Lượng Carbon Rừng Cần Giờ
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Căn cứ bản đồ quy hoạch rừng phòng hộ và số liệu đo đạc sinh khối lâm học
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">4 Phân khu trọng điểm</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 pr-4 font-semibold">Phân Khu Sinh Thái</th>
                <th className="py-2.5 px-4 font-semibold text-right">Diện Tích (ha)</th>
                <th className="py-2.5 px-4 font-semibold">Quần Xã Thực Vật Chủ Đạo</th>
                <th className="py-2.5 px-4 font-semibold text-right">Mật Độ Carbon (tCO2/ha)</th>
                <th className="py-2.5 pl-4 font-semibold">Đặc Tính Sinh Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {CAN_GIO_ZONES.map((zone, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pr-4 font-sans font-medium text-white">{zone.name}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold">{zone.areaHa.toLocaleString('vi-VN')} ha</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{zone.dominantSpecies}</td>
                  <td className="py-3 px-4 text-right text-teal-300 font-bold">{zone.carbonDensityTonPerHa}</td>
                  <td className="py-3 pl-4 font-sans text-slate-400 text-[11px]">{zone.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SƠ ĐỒ CHUỖI CUNG ỨNG NGƯỢC & DÒNG TIỀN BẢO TỒN TUẦN HOÀN */}
      <div id="reverse-logistics-section" className="scroll-mt-20">
        <ReverseLogisticsMap />
      </div>
    </div>
  );
};
