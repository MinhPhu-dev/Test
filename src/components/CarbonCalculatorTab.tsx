import React, { useState } from 'react';
import { 
  Building2, Zap, Fuel, DollarSign, TrendingUp, HelpCircle, 
  ArrowRight, ShieldCheck, PieChart, BarChart3, RotateCcw, FileText
} from 'lucide-react';
import { EmissionInputs, EmissionFactors, EmissionResults } from '../types';
import { ScenarioSimulation } from './ScenarioSimulation';
import { ESGReportModal } from './ESGReportModal';

interface CarbonCalculatorTabProps {
  inputs: EmissionInputs;
  setInputs: React.Dispatch<React.SetStateAction<EmissionInputs>>;
  factors: EmissionFactors;
  setFactors: React.Dispatch<React.SetStateAction<EmissionFactors>>;
  carbonPrice: number;
  setCarbonPrice: (val: number) => void;
  usdRate: number;
  results: EmissionResults;
  onProceedToTrade: () => void;
}

export const CarbonCalculatorTab: React.FC<CarbonCalculatorTabProps> = ({
  inputs,
  setInputs,
  factors,
  setFactors,
  carbonPrice,
  setCarbonPrice,
  usdRate,
  results,
  onProceedToTrade
}) => {
  const [showFactorConfig, setShowFactorConfig] = useState(false);
  const [isESGReportOpen, setIsESGReportOpen] = useState(false);

  // Preset templates
  const applyPreset = (type: 'sme_manufacturing' | 'retail_chain' | 'tech_office') => {
    if (type === 'sme_manufacturing') {
      setInputs({
        companyName: 'Công ty Cổ phần Chế tạo Cơ khí Tân Bình',
        industry: 'Sản xuất công nghiệp nhẹ',
        scale: 'medium',
        period: 'year',
        electricityKWh: 540000,
        petrolLiters: 12000,
        dieselLiters: 48000
      });
    } else if (type === 'retail_chain') {
      setInputs({
        companyName: 'Hệ thống Bán lẻ & Chuỗi Siêu thị Việt Xanh',
        industry: 'Bán lẻ & Phân phối logistics',
        scale: 'large',
        period: 'year',
        electricityKWh: 820000,
        petrolLiters: 35000,
        dieselLiters: 65000
      });
    } else {
      setInputs({
        companyName: 'Công ty Phần mềm & Dịch vụ Số Saigon Tech',
        industry: 'Công nghệ thông tin & Văn phòng',
        scale: 'small',
        period: 'year',
        electricityKWh: 95000,
        petrolLiters: 4500,
        dieselLiters: 2000
      });
    }
  };

  // Sensitivity scenarios
  const priceScenarios = [10, 15, 25, 35, 50, 75];

  // Donut chart percentages
  const scope1PetrolPct = results.totalEmissionTon > 0 ? (results.scope1PetrolTon / results.totalEmissionTon) * 100 : 0;
  const scope1DieselPct = results.totalEmissionTon > 0 ? (results.scope1DieselTon / results.totalEmissionTon) * 100 : 0;
  const scope2Pct = results.totalEmissionTon > 0 ? (results.totalScope2Ton / results.totalEmissionTon) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Intro header with clean unboxed metadata */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span>Phương pháp luận GHG Protocol</span>
              <span aria-hidden="true">·</span>
              <span>Scope 1 (Trực tiếp) & Scope 2 (Điện lưới)</span>
              <span aria-hidden="true">·</span>
              <span>Định giá Dynamic Valuation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Công cụ Tính toán Phát thải & Định giá Tín chỉ Doanh nghiệp
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Nhập số liệu tiêu thụ điện năng và nhiên liệu vận hành để kiểm kê lượng phát thải CO2e. 
              Bộ máy định giá động sẽ tự động xác định nghĩa vụ tài chính cần bù đắp theo giá thị trường tín chỉ carbon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsESGReportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-lg hover:bg-emerald-900/60 hover:border-emerald-400 transition-colors whitespace-nowrap shadow-sm"
              title="Xuất báo cáo kiểm kê GHG & ESG mẫu chuẩn ISO 14064"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Báo Cáo ESG & ISO 14064</span>
            </button>
            <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
            <span className="text-xs text-slate-400 whitespace-nowrap">Mẫu:</span>
            <button
              onClick={() => applyPreset('sme_manufacturing')}
              className="px-2.5 py-1 text-xs font-medium rounded bg-slate-700/60 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Sản xuất
            </button>
            <button
              onClick={() => applyPreset('retail_chain')}
              className="px-2.5 py-1 text-xs font-medium rounded bg-slate-700/60 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Logistics
            </button>
            <button
              onClick={() => applyPreset('tech_office')}
              className="px-2.5 py-1 text-xs font-medium rounded bg-slate-700/60 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Văn phòng
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>1. Hồ sơ Doanh nghiệp & Kỳ Kiểm kê</span>
              </h2>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">Dữ liệu đầu vào</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-100 mb-1">
                  Tên Doanh nghiệp / Tổ chức
                </label>
                <input
                  type="text"
                  value={inputs.companyName}
                  onChange={(e) => setInputs({ ...inputs, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Nhập tên doanh nghiệp..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-100 mb-1">
                    Quy mô doanh nghiệp
                  </label>
                  <select
                    value={inputs.scale}
                    onChange={(e) => setInputs({ ...inputs, scale: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="small">Doanh nghiệp nhỏ (&lt; 100)</option>
                    <option value="medium">Doanh nghiệp vừa (100 - 300)</option>
                    <option value="large">Doanh nghiệp lớn (&gt; 300)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-100 mb-1">
                    Kỳ kiểm kê báo cáo
                  </label>
                  <select
                    value={inputs.period}
                    onChange={(e) => setInputs({ ...inputs, period: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="year">Cả năm (12 tháng)</option>
                    <option value="quarter">Theo quý (3 tháng)</option>
                    <option value="month">Theo tháng</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Energy Consumption Inputs */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>2. Tiêu thụ Năng lượng Thực tế</span>
              </h2>
              <span className="text-[11px] text-amber-400 font-mono font-medium">Scope 1 & 2</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Điện năng tiêu thụ (Scope 2)</span>
                  </label>
                  <span className="text-[11px] text-slate-300 font-mono">kWh</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.electricityKWh}
                  onChange={(e) => setInputs({ ...inputs, electricityKWh: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-300">
                  <span>Hệ số lưới điện EVN: {factors.gridElectricity} kg CO2/kWh</span>
                  <span className="text-blue-400 font-mono font-bold">{results.totalScope2Ton.toFixed(2)} tCO2</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Xăng RON 95 phương tiện (Scope 1)</span>
                  </label>
                  <span className="text-[11px] text-slate-300 font-mono">Lít</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={inputs.petrolLiters}
                  onChange={(e) => setInputs({ ...inputs, petrolLiters: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-300">
                  <span>Hệ số IPCC: {factors.petrol} kg CO2/L</span>
                  <span className="text-amber-400 font-mono font-bold">{results.scope1PetrolTon.toFixed(2)} tCO2</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>Dầu Diesel máy công trình & xe tải (Scope 1)</span>
                  </label>
                  <span className="text-[11px] text-slate-300 font-mono">Lít</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={inputs.dieselLiters}
                  onChange={(e) => setInputs({ ...inputs, dieselLiters: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-red-500"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-300">
                  <span>Hệ số IPCC: {factors.diesel} kg CO2/L</span>
                  <span className="text-red-400 font-mono font-bold">{results.scope1DieselTon.toFixed(2)} tCO2</span>
                </div>
              </div>
            </div>

            {/* Toggle Factor Config */}
            <div className="pt-2 border-t border-slate-700/60">
              <button
                type="button"
                onClick={() => setShowFactorConfig(!showFactorConfig)}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>{showFactorConfig ? 'Thu gọn' : 'Tùy chỉnh'} hệ số phát thải chuẩn (EF)</span>
              </button>

              {showFactorConfig && (
                <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-slate-700/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lưới điện VN (kg CO2/kWh):</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={factors.gridElectricity}
                      onChange={(e) => setFactors({ ...factors, gridElectricity: Number(e.target.value) })}
                      className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-right font-mono text-white text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Xăng (kg CO2/L):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={factors.petrol}
                      onChange={(e) => setFactors({ ...factors, petrol: Number(e.target.value) })}
                      className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-right font-mono text-white text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Diesel (kg CO2/L):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={factors.diesel}
                      onChange={(e) => setFactors({ ...factors, diesel: Number(e.target.value) })}
                      className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-right font-mono text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Carbon Price Slider */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>3. Giá Tín Chỉ Carbon Thị Trường</span>
              </label>
              <div className="text-right">
                <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                  ${carbonPrice.toFixed(1)}
                </span>
                <span className="text-xs text-slate-300 ml-1">/ tấn CO2</span>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="60"
              step="0.5"
              value={carbonPrice}
              onChange={(e) => setCarbonPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[11px] text-slate-300 font-mono">
              <span>$5/t (Thị trường mở)</span>
              <span>$15/t (Tham chiếu)</span>
              <span>$35/t (Chất lượng cao)</span>
              <span>$60/t (EU ETS / CORSIA)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Engine Results & Charts (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Emission Summary Card */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
              <div>
                <span className="text-xs text-slate-300 font-medium">Kết quả kiểm kê khí nhà kính</span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Tổng Phát Thải Khí Nhà Kính
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  {results.totalEmissionTon.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-slate-200 ml-1.5 font-bold">tấn CO2e</span>
              </div>
            </div>

            {/* Scope Breakdown Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-300 font-semibold mb-1">Scope 1 (Trực tiếp)</div>
                <div className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                  {results.totalScope1Ton.toFixed(2)}
                  <span className="text-xs text-slate-300 font-normal ml-1">tCO2</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Xăng + Dầu vận hành</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-300 font-semibold mb-1">Scope 2 (Gián tiếp)</div>
                <div className="text-lg font-bold text-blue-400 font-mono tabular-nums">
                  {results.totalScope2Ton.toFixed(2)}
                  <span className="text-xs text-slate-300 font-normal ml-1">tCO2</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Điện lưới quốc gia</div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-emerald-950/50 border border-emerald-500/40 rounded-lg p-3">
                <div className="text-xs text-emerald-300 font-bold mb-1">Chi phí Bù đắp Net Zero</div>
                <div className="text-lg font-bold text-emerald-300 font-mono tabular-nums">
                  ${results.offsetCostUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[11px] text-emerald-400/90 mt-0.5 font-mono">
                  ≈ {(results.offsetCostVND / 1000000).toFixed(1)} triệu VNĐ
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Donut & Stack Visualizer */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <span>Cơ Cấu Nguồn Phát Thải (Scope 1 & 2)</span>
              </span>
              <span className="text-xs text-slate-300 font-mono">Tỷ trọng %</span>
            </h3>

            {/* Proportion Bar */}
            <div className="space-y-3">
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${scope1PetrolPct}%` }} 
                  className="bg-amber-500 h-full transition-all duration-300" 
                  title={`Xăng: ${scope1PetrolPct.toFixed(1)}%`}
                />
                <div 
                  style={{ width: `${scope1DieselPct}%` }} 
                  className="bg-red-500 h-full transition-all duration-300" 
                  title={`Diesel: ${scope1DieselPct.toFixed(1)}%`}
                />
                <div 
                  style={{ width: `${scope2Pct}%` }} 
                  className="bg-blue-500 h-full transition-all duration-300" 
                  title={`Điện lưới: ${scope2Pct.toFixed(1)}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0"></div>
                  <div className="truncate">
                    <span className="text-slate-300">Xăng: </span>
                    <span className="text-white font-mono font-semibold">{scope1PetrolPct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-red-500 shrink-0"></div>
                  <div className="truncate">
                    <span className="text-slate-300">Diesel: </span>
                    <span className="text-white font-mono font-semibold">{scope1DieselPct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0"></div>
                  <div className="truncate">
                    <span className="text-slate-300">Điện: </span>
                    <span className="text-white font-mono font-semibold">{scope2Pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Valuation Sensitivity Chart */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Phân Tích Độ Nhạy Chi Phí Bù Đắp Theo Mức Giá Thị Trường</span>
              </h3>
              <span className="text-xs text-slate-300 font-medium">Ngân sách dự phòng</span>
            </div>

            <div className="space-y-2.5">
              {priceScenarios.map((price) => {
                const costUSD = results.totalEmissionTon * price;
                const costVNDM = (costUSD * usdRate) / 1000000;
                const maxCost = results.totalEmissionTon * 75;
                const barWidth = maxCost > 0 ? (costUSD / maxCost) * 100 : 0;
                const isCurrent = Math.abs(price - carbonPrice) < 3;

                return (
                  <div key={price} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-mono ${isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                        ${price}/tCO2 {isCurrent && '★ (Đang chọn)'}
                      </span>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="text-white font-bold">${costUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        <span className="text-slate-300 text-[11px]">({costVNDM.toFixed(1)} tr VNĐ)</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${barWidth}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCurrent ? 'bg-emerald-400' : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <span>Khối lượng cần bù đắp để đạt Net Zero: </span>
                <b className="text-white font-mono text-sm">{results.totalEmissionTon.toFixed(2)} tCO2e</b>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsESGReportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 rounded-lg transition-colors whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Xem Báo Cáo ESG / ISO 14064</span>
                </button>
                <button
                  onClick={onProceedToTrade}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Chuyển sang Sàn Bù đắp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MÔ PHỎNG KỊCH BẢN GIẢM PHÁT THẢI (WHAT-IF ANALYSIS & DECISION SUPPORT SYSTEM) */}
      <ScenarioSimulation
        inputs={inputs}
        factors={factors}
        results={results}
        carbonPrice={carbonPrice}
        usdRate={usdRate}
      />

      {/* MODAL XUẤT BÁO CÁO ESG & KIỂM KÊ GHG CHUẨN ISO 14064 */}
      <ESGReportModal
        isOpen={isESGReportOpen}
        onClose={() => setIsESGReportOpen(false)}
        inputs={inputs}
        factors={factors}
        results={results}
        carbonPrice={carbonPrice}
        usdRate={usdRate}
      />
    </div>
  );
};
