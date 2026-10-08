import React, { useState } from 'react';
import { 
  TreePine, Waves, Compass, Layers, ShieldCheck, 
  TrendingUp, Info, MapPin, Eye, Workflow
} from 'lucide-react';
import { CAN_GIO_ECO_METRICS, CAN_GIO_ZONES } from '../constants/scienceData';
import { InteractiveEcoMap } from './InteractiveEcoMap';

export const EcoDashboardTab: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'all' | 'baseline' | 'enhanced' | 'vulnerable'>('all');
  const [forecastYear, setForecastYear] = useState<number>(2030);

  // Mangrove image asset
  const mangroveImg = 'cangio_mangrove_forest_1790662934230.jpg';

  // Projection logic
const years = Array.from({ length: 10 }, (_, i) => 2026 + i);

  
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

      {/* Lớp Bản đồ không gian địa lý vệ tinh tương tác thông minh */}
      <InteractiveEcoMap />

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
        {/* Left: Carbon Pools Breakdown */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Phân Bổ Chỉ Số Hấp Thụ Thực Địa</span>
            </h3>
            <div className="space-y-3">
              {CAN_GIO_ZONES.map((zone) => (
                <div key={zone.name} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>{zone.name}</span>
                    <span className="font-mono text-emerald-400">{zone.areaHa.toLocaleString('vi-VN')} ha</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Loài cây: {zone.dominantSpecies}</span>
                    <span>{zone.carbonDensityTonPerHa} t/ha</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-1">"{zone.description}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Simulation Forecast Chart */}
        <div className="lg:col-span-7 bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Dự Báo Mô Phỏng Hấp Thụ 10 Năm (2026 - 2035)</span>
            </h3>
            
            <div className="flex gap-2">
              {(['all', 'baseline', 'enhanced', 'vulnerable'] as const).map((scen) => (
                <button
                  key={scen}
                  onClick={() => setSelectedScenario(scen)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    selectedScenario === scen
                      ? 'bg-slate-950 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {scen === 'all' ? 'Tất cả' : scen === 'baseline' ? 'Hiện trạng' : scen === 'enhanced' ? 'Tăng cường' : 'Rủi ro khí hậu'}
                </button>
              ))}
            </div>

            {/* Simulated Chart Matrix Graphic */}
                        <div className="h-48 bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex items-end gap-1 relative overflow-hidden shadow-inner">
              <div className="absolute top-2 right-3 flex items-center gap-3 text-[10px] font-mono text-slate-500">
                <span>Năm dự báo: {forecastYear}</span>
                <span>Hấp thụ: {Math.round(getAbsorption(forecastYear, selectedScenario === 'all' ? 'enhanced' : selectedScenario)).toLocaleString()} tCO2</span>
              </div>
              
              {years.map((y, idx) => {
                const baseH = ((getAbsorption(y, 'baseline') - 600000) / 350000) * 100;
                const enhH = ((getAbsorption(y, 'enhanced') - 600000) / 350000) * 100;
                const vulH = ((getAbsorption(y, 'vulnerable') - 600000) / 350000) * 100;

                return (
                  <div key={y} className="flex-1 h-full flex flex-col justify-end items-center gap-1 group/bar cursor-pointer" onClick={() => setForecastYear(y)}>
                    <div className="w-full flex items-end gap-0.5 h-full px-1">
                      {(selectedScenario === 'all' || selectedScenario === 'baseline') && (
                        <div className="flex-1 bg-sky-500/40 border border-sky-400/30 rounded-t group-hover/bar:bg-sky-400 transition-colors" style={{ height: `${Math.max(10, baseH)}%` }} />
                      )}
                      {(selectedScenario === 'all' || selectedScenario === 'enhanced') && (
                        <div className="flex-1 bg-emerald-500/40 border border-emerald-400/30 rounded-t group-hover/bar:bg-emerald-400 transition-colors" style={{ height: `${Math.max(10, enhH)}%` }} />
                      )}
                      {(selectedScenario === 'all' || selectedScenario === 'vulnerable') && (
                        <div className="flex-1 bg-rose-500/40 border border-rose-400/30 rounded-t group-hover/bar:bg-rose-400 transition-colors" style={{ height: `${Math.max(10, vulH)}%` }} />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1">{y}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

