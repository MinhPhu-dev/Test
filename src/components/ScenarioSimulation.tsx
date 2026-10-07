import React, { useState, useMemo } from 'react';
import { 
  Sliders, Sun, Truck, BatteryCharging, Lightbulb, TrendingDown, 
  DollarSign, ArrowDownRight, Award, CheckCircle2, RotateCcw, 
  Sparkles, HelpCircle, BarChart2
} from 'lucide-react';
import { EmissionInputs, EmissionFactors, EmissionResults, ScenarioInputs, ScenarioResults } from '../types';

interface ScenarioSimulationProps {
  inputs: EmissionInputs;
  factors: EmissionFactors;
  results: EmissionResults;
  carbonPrice: number;
  usdRate: number;
}

export const ScenarioSimulation: React.FC<ScenarioSimulationProps> = ({
  inputs,
  factors,
  results,
  carbonPrice,
  usdRate
}) => {
  const [scenario, setScenario] = useState<ScenarioInputs>({
    solarPercentage: 35,
    logisticsOptPercentage: 20,
    evFleetPercentage: 25,
    energyEfficiencyPercentage: 15
  });

  const [activePreset, setActivePreset] = useState<string>('moderate');

  // Pre-configured strategy presets
  const applyScenarioPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === 'bau') {
      setScenario({
        solarPercentage: 0,
        logisticsOptPercentage: 0,
        evFleetPercentage: 0,
        energyEfficiencyPercentage: 0
      });
    } else if (presetKey === 'moderate') {
      setScenario({
        solarPercentage: 35,
        logisticsOptPercentage: 20,
        evFleetPercentage: 25,
        energyEfficiencyPercentage: 15
      });
    } else if (presetKey === 'aggressive') {
      setScenario({
        solarPercentage: 60,
        logisticsOptPercentage: 35,
        evFleetPercentage: 55,
        energyEfficiencyPercentage: 20
      });
    } else if (presetKey === 'netzero') {
      setScenario({
        solarPercentage: 85,
        logisticsOptPercentage: 45,
        evFleetPercentage: 80,
        energyEfficiencyPercentage: 25
      });
    }
  };

  // Live Scenario Calculation Engine
  const scenarioResults: ScenarioResults = useMemo(() => {
    // 1. Scope 2 Impact:
    // Efficiency cuts total demand first, then solar replaces portion of grid power
    const demandAfterEfficiency = inputs.electricityKWh * (1 - scenario.energyEfficiencyPercentage / 100);
    const gridPowerNeeded = demandAfterEfficiency * (1 - scenario.solarPercentage / 100);
    const mitigatedScope2Ton = (gridPowerNeeded * factors.gridElectricity) / 1000;

    // 2. Scope 1 Impact:
    // Logistics optimization reduces total fuel use, and EV conversion replaces petrol/diesel
    const fuelReductionFactor = (1 - scenario.logisticsOptPercentage / 100) * (1 - scenario.evFleetPercentage / 100);
    const mitigatedPetrolLiters = inputs.petrolLiters * fuelReductionFactor;
    const mitigatedDieselLiters = inputs.dieselLiters * fuelReductionFactor;
    const mitigatedScope1Ton = (mitigatedPetrolLiters * factors.petrol + mitigatedDieselLiters * factors.diesel) / 1000;

    // Total and Abatement
    const mitigatedTotalTon = mitigatedScope1Ton + mitigatedScope2Ton;
    const abatedTon = Math.max(0, results.totalEmissionTon - mitigatedTotalTon);
    const abatedPercentage = results.totalEmissionTon > 0 ? (abatedTon / results.totalEmissionTon) * 100 : 0;

    // Financial Metrics
    const originalCostUSD = results.offsetCostUSD;
    const mitigatedCostUSD = mitigatedTotalTon * carbonPrice;
    const costSavedUSD = Math.max(0, originalCostUSD - mitigatedCostUSD);
    const costSavedVND = costSavedUSD * usdRate;

    // Estimated Direct OPEX Energy Savings:
    // Avg industrial electricity price ~ 2,050 VND/kWh
    // Avg fuel price (petrol/diesel avg) ~ 23,500 VND/liter
    const electricityKWhSaved = Math.max(0, inputs.electricityKWh - gridPowerNeeded);
    const fuelLitersSaved = Math.max(0, (inputs.petrolLiters + inputs.dieselLiters) - (mitigatedPetrolLiters + mitigatedDieselLiters));
    const energyOpexSavedVND = (electricityKWhSaved * 2050) + (fuelLitersSaved * 23500);

    return {
      mitigatedScope1Ton,
      mitigatedScope2Ton,
      mitigatedTotalTon,
      abatedTon,
      abatedPercentage,
      originalCostUSD,
      mitigatedCostUSD,
      costSavedUSD,
      costSavedVND,
      energyOpexSavedVND
    };
  }, [inputs, factors, results, carbonPrice, usdRate, scenario]);

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 sm:p-7 shadow-xl shadow-black/40 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              Decision Support System · What-if Analysis
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">|</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Hỗ trợ ra quyết định chiến lược chuyển đổi xanh</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>Mô Phỏng Kịch Bản Giảm Phát Thải & Lợi Ích Kinh Tế Kép</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            Tự động tính toán lượng phát thải và chi phí mua tín chỉ carbon giảm đi bao nhiêu nếu doanh nghiệp đầu tư điện mặt trời mái nhà, điện hóa đội xe và tối ưu hóa chuỗi cung ứng logistics.
          </p>
        </div>

        {/* Preset strategy buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto">
          <button
            onClick={() => applyScenarioPreset('bau')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'bau' 
                ? 'bg-slate-700 text-white font-semibold shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Hiện trạng (BAU)
          </button>
          <button
            onClick={() => applyScenarioPreset('moderate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'moderate' 
                ? 'bg-emerald-600 text-white font-semibold shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Chuyển dịch vừa (35%)
          </button>
          <button
            onClick={() => applyScenarioPreset('aggressive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'aggressive' 
                ? 'bg-emerald-600 text-white font-semibold shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Tham vọng ESG (60%)
          </button>
          <button
            onClick={() => applyScenarioPreset('netzero')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'netzero' 
                ? 'bg-emerald-500 text-slate-950 font-bold shadow' 
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60'
            }`}
          >
            Tiên phong Net Zero
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Real-time DSS Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 4 Interactive Levers (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Cần gạt tham số can thiệp (Levers)</span>
            <span className="text-[11px] text-emerald-400 font-mono">Tự động tính toán tức thời</span>
          </div>

          {/* Lever 1: Solar */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-2 hover:border-emerald-500/40 transition-colors">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Điện Mặt Trời Mái Nhà (Solar PV)</span>
              </span>
              <span className="font-mono text-amber-400 font-bold text-sm">{scenario.solarPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={scenario.solarPercentage}
              onChange={(e) => {
                setActivePreset('custom');
                setScenario(prev => ({ ...prev, solarPercentage: Number(e.target.value) }));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% (Phụ thuộc lưới)</span>
              <span>Cắt giảm điện lưới Scope 2</span>
              <span>100% Tự chủ</span>
            </div>
          </div>

          {/* Lever 2: Logistics Route Optimization */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-2 hover:border-emerald-500/40 transition-colors">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                <span>Tối Ưu Tuyến Đường & Vận Tải Logistics</span>
              </span>
              <span className="font-mono text-sky-400 font-bold text-sm">{scenario.logisticsOptPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={scenario.logisticsOptPercentage}
              onChange={(e) => {
                setActivePreset('custom');
                setScenario(prev => ({ ...prev, logisticsOptPercentage: Number(e.target.value) }));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% Không đổi</span>
              <span>Ứng dụng AI phân tuyến & gộp đơn</span>
              <span>Tối đa 50%</span>
            </div>
          </div>

          {/* Lever 3: EV Fleet Transition */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-2 hover:border-emerald-500/40 transition-colors">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                <span>Điện Hóa Đội Xe Doanh Nghiệp (EV Fleet)</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold text-sm">{scenario.evFleetPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={scenario.evFleetPercentage}
              onChange={(e) => {
                setActivePreset('custom');
                setScenario(prev => ({ ...prev, evFleetPercentage: Number(e.target.value) }));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% Xe xăng dầu</span>
              <span>Thay thế xe xăng dầu Scope 1</span>
              <span>100% Thuần điện</span>
            </div>
          </div>

          {/* Lever 4: Energy Efficiency */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-2 hover:border-emerald-500/40 transition-colors">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                <span>Hiệu Quả Năng Lượng & IoT Công Nghiệp</span>
              </span>
              <span className="font-mono text-indigo-400 font-bold text-sm">{scenario.energyEfficiencyPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={scenario.energyEfficiencyPercentage}
              onChange={(e) => {
                setActivePreset('custom');
                setScenario(prev => ({ ...prev, energyEfficiencyPercentage: Number(e.target.value) }));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% Cơ bản</span>
              <span>Biến tần, LED, cảm biến tải thông minh</span>
              <span>Tối đa 30%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Comparison Metrics & Visual DSS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Kết quả so sánh kịch bản (What-if Impact)</span>
            <span className="text-[11px] text-slate-400">So với Hiện trạng phát thải (BAU)</span>
          </div>

          {/* Key 4 Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: % Reduction */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3 space-y-1">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Tỷ lệ giảm phát thải</div>
              <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight flex items-baseline gap-1">
                <span>-{scenarioResults.abatedPercentage.toFixed(1)}%</span>
              </div>
              <div className="text-[10px] text-emerald-500/90 font-medium">Cắt giảm sâu</div>
            </div>

            {/* Metric 2: Abated Tons */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">CO2e tránh phát thải</div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                {scenarioResults.abatedTon.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-400">tCO2e / năm</div>
            </div>

            {/* Metric 3: Offset Cost Saved */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Tiết kiệm mua tín chỉ</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
                ${scenarioResults.costSavedUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-400">~{(scenarioResults.costSavedVND / 1000000).toFixed(1)} tr VNĐ/năm</div>
            </div>

            {/* Metric 4: Direct OPEX Saved */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Tiết kiệm tiền điện/xăng</div>
              <div className="text-lg sm:text-xl font-black text-sky-400 font-mono tracking-tight">
                {(scenarioResults.energyOpexSavedVND / 1000000).toFixed(0)} tr
              </div>
              <div className="text-[10px] text-slate-400">VNĐ chi phí vận hành</div>
            </div>
          </div>

          {/* Visual Before vs After Comparison Bars */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span>So Sánh Cơ Cấu Phát Thải: Trước (BAU) vs Sau Can Thiệp Kịch Bản</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-normal">
                {results.totalEmissionTon.toFixed(1)} tCO2 ➔ {scenarioResults.mitigatedTotalTon.toFixed(1)} tCO2
              </span>
            </div>

            {/* Baseline Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">1. Kịch bản Hiện trạng (BAU - Chưa can thiệp):</span>
                <span className="font-mono font-bold text-white">{results.totalEmissionTon.toFixed(1)} tCO2e (100%)</span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-lg overflow-hidden flex">
                <div 
                  style={{ width: `${results.totalEmissionTon > 0 ? (results.totalScope1Ton / results.totalEmissionTon) * 100 : 0}%` }} 
                  className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                  title={`Scope 1: ${results.totalScope1Ton.toFixed(1)} tCO2`}
                >
                  {results.totalScope1Ton > 15 ? 'Scope 1' : ''}
                </div>
                <div 
                  style={{ width: `${results.totalEmissionTon > 0 ? (results.totalScope2Ton / results.totalEmissionTon) * 100 : 0}%` }} 
                  className="bg-sky-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                  title={`Scope 2: ${results.totalScope2Ton.toFixed(1)} tCO2`}
                >
                  Scope 2
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-amber-400">• Scope 1: {results.totalScope1Ton.toFixed(1)} t</span>
                <span className="text-sky-400">• Scope 2: {results.totalScope2Ton.toFixed(1)} t</span>
                <span className="text-slate-400">Chi phí tín chỉ: ${results.offsetCostUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Mitigated Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Kịch bản Sau Can Thiệp (Mitigated Pathway):</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {scenarioResults.mitigatedTotalTon.toFixed(1)} tCO2e ({(100 - scenarioResults.abatedPercentage).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-lg overflow-hidden flex relative">
                {/* Active portion */}
                <div 
                  style={{ width: `${results.totalEmissionTon > 0 ? (scenarioResults.mitigatedScope1Ton / results.totalEmissionTon) * 100 : 0}%` }} 
                  className="bg-amber-500/80 h-full"
                  title={`Scope 1 còn lại: ${scenarioResults.mitigatedScope1Ton.toFixed(1)} tCO2`}
                />
                <div 
                  style={{ width: `${results.totalEmissionTon > 0 ? (scenarioResults.mitigatedScope2Ton / results.totalEmissionTon) * 100 : 0}%` }} 
                  className="bg-sky-500/80 h-full"
                  title={`Scope 2 còn lại: ${scenarioResults.mitigatedScope2Ton.toFixed(1)} tCO2`}
                />
                {/* Abated (Saved) portion with stripes */}
                <div 
                  style={{ width: `${results.totalEmissionTon > 0 ? (scenarioResults.abatedTon / results.totalEmissionTon) * 100 : 0}%` }} 
                  className="bg-emerald-500/30 border-l border-emerald-400/50 h-full flex items-center justify-center text-[10px] font-bold text-emerald-300"
                  title={`Đã cắt giảm được: ${scenarioResults.abatedTon.toFixed(1)} tCO2`}
                >
                  Giảm {scenarioResults.abatedTon.toFixed(1)} t
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-amber-300">• Scope 1 còn: {scenarioResults.mitigatedScope1Ton.toFixed(1)} t</span>
                <span className="text-sky-300">• Scope 2 còn: {scenarioResults.mitigatedScope2Ton.toFixed(1)} t</span>
                <span className="text-emerald-400 font-semibold">Tín chỉ cần mua chỉ còn: ${scenarioResults.mitigatedCostUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Strategic Decision Support Insight */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 text-xs space-y-1.5 leading-relaxed">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Khuyến Nghị Chiến Lược Cho Doanh Nghiệp (DSS Recommendation):</span>
            </div>
            <p className="text-slate-300 text-[11.5px]">
              Theo thứ bậc giảm thải chuẩn quốc tế (<b>Mitigation Hierarchy: Tránh ➔ Cắt giảm tại nguồn ➔ Bù đắp tín chỉ</b>), kịch bản này giúp doanh nghiệp đạt <b>Lợi ích kinh tế kép (Double Dividend)</b>: Vừa giảm ngay <b>${scenarioResults.costSavedUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD</b> tiền mua tín chỉ carbon, vừa tiết kiệm trực tiếp <b>~{(scenarioResults.energyOpexSavedVND / 1000000).toFixed(0)} triệu VNĐ</b> chi phí điện và xăng dầu mỗi năm. Lượng phát thải còn lại ({scenarioResults.mitigatedTotalTon.toFixed(1)} tCO2) có thể bù đắp qua Rừng Cần Giờ để đạt chuẩn Net Zero bền vững nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
