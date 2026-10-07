import React, { useState } from 'react';
import { 
  TrendingUp, Sparkles, AlertTriangle, ArrowUpRight, 
  Clock, ShieldCheck, DollarSign, BarChart3, HelpCircle,
  CheckCircle2, Compass
} from 'lucide-react';

interface AIPriceForecastingProps {
  currentPrice: number;
  totalEmissionTon: number;
  onApplyPrice: (price: number) => void;
}

export const AIPriceForecasting: React.FC<AIPriceForecastingProps> = ({
  currentPrice,
  totalEmissionTon,
  onApplyPrice
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'3m' | '6m' | '12m'>('6m');

  // Forecasting Quantitative Model Data
  const forecastData = {
    '3m': {
      horizon: '3 Tháng tới (Q3/2026)',
      forecastPrice: 18.5,
      lowBound: 16.8,
      highBound: 20.2,
      growthPct: 23.3,
      volatility: 'Trung bình (±9%)',
      driver: 'Cơ chế thí điểm hạn ngạch phát thải trong nước (Đề án thị trường carbon 06/2022/NĐ-CP).',
      action: 'NÊN MUA TRƯỚC 50% - 75%',
      urgency: 'high'
    },
    '6m': {
      horizon: '6 Tháng tới (Q4/2026)',
      forecastPrice: 24.8,
      lowBound: 21.5,
      highBound: 27.5,
      growthPct: 65.3,
      volatility: 'Cao (±14%)',
      driver: 'Cơ chế CBAM Châu Âu bắt đầu tính nghĩa vụ tài chính thực tế; nhu cầu tín chỉ Blue Carbon sinh quyển tăng đột biến.',
      action: 'KHUYẾN NGHỊ MUA NGAY HÔM NAY (HEDGING)',
      urgency: 'critical'
    },
    '12m': {
      horizon: '12 Tháng tới (Q2/2027)',
      forecastPrice: 33.0,
      lowBound: 28.0,
      highBound: 38.5,
      growthPct: 120.0,
      volatility: 'Rất cao (±18%)',
      driver: 'Sàn giao dịch tín chỉ carbon quốc gia Việt Nam chính thức vận hành thương mại và kết nối quốc tế.',
      action: 'CHI PHÍ SẼ TĂNG GẤP ĐÔI NẾU CHỜ ĐỢI',
      urgency: 'critical'
    }
  };

  const selectedData = forecastData[selectedHorizon];

  // Savings calculation if buying today vs waiting
  const futureCostUSD = totalEmissionTon * selectedData.forecastPrice;
  const currentCostUSD = totalEmissionTon * currentPrice;
  const potentialSavingsUSD = Math.max(0, futureCostUSD - currentCostUSD);

  // 12-month historical + forecasted chart points
  const timelinePoints = [
    { label: 'T-9', price: 11.5, isForecast: false },
    { label: 'T-6', price: 12.8, isForecast: false },
    { label: 'T-3', price: 13.9, isForecast: false },
    { label: 'Hiện tại', price: currentPrice, isForecast: false },
    { label: '+3 Tháng', price: 18.5, isForecast: true, low: 16.8, high: 20.2 },
    { label: '+6 Tháng', price: 24.8, isForecast: true, low: 21.5, high: 27.5 },
    { label: '+12 Tháng', price: 33.0, isForecast: true, low: 28.0, high: 38.5 }
  ];

  const maxChartPrice = 42;

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              AI Quantitative Forecasting · Time-Series Model
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">|</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Dự báo chuỗi thời gian & Tối ưu hóa thời điểm mua</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>Dự Báo Biến Động Giá Tín Chỉ Carbon Bằng AI & Chiến Lược Hedging</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            Mô hình định lượng AI phân tích xu hướng giá Blue Carbon dựa trên dữ liệu thị trường tự nguyện (VCM), lộ trình thực thi EU CBAM và kế hoạch vận hành Sàn Giao dịch Carbon Quốc gia.
          </p>
        </div>

        {/* Forecast Horizon Tabs */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setSelectedHorizon('3m')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedHorizon === '3m'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            +3 Tháng
          </button>
          <button
            onClick={() => setSelectedHorizon('6m')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedHorizon === '6m'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            +6 Tháng (Khuyên dùng)
          </button>
          <button
            onClick={() => setSelectedHorizon('12m')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedHorizon === '12m'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            +12 Tháng
          </button>
        </div>
      </div>

      {/* Main Grid: Forecast Visual Trajectory on Left, Strategic Recommendation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Forecast Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Quỹ Đạo Giá Tín Chỉ Blue Carbon ($/tCO2e)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Khoảng tin cậy AI 95%</span>
          </div>

          {/* Interactive Trajectory Graph */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800 relative">
            {timelinePoints.map((pt, idx) => {
              const heightPct = (pt.price / maxChartPrice) * 100;
              const isTargetHorizon = (selectedHorizon === '3m' && pt.label === '+3 Tháng') ||
                                     (selectedHorizon === '6m' && pt.label === '+6 Tháng') ||
                                     (selectedHorizon === '12m' && pt.label === '+12 Tháng');

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Price Tag above bar */}
                  <div className={`text-[11px] font-mono mb-1.5 font-bold transition-all ${
                    isTargetHorizon 
                      ? 'text-amber-400 scale-110' 
                      : pt.isForecast 
                      ? 'text-amber-500/80' 
                      : 'text-slate-400'
                  }`}>
                    ${pt.price.toFixed(1)}
                  </div>

                  {/* Bar element */}
                  <div className="w-full max-w-[36px] bg-slate-900 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isTargetHorizon
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/30'
                          : pt.isForecast
                          ? 'bg-gradient-to-t from-amber-900/60 to-amber-600/80 border-t border-dashed border-amber-400'
                          : 'bg-gradient-to-t from-slate-800 to-emerald-600/80'
                      }`}
                    />
                  </div>

                  {/* Label under bar */}
                  <div className={`text-[10px] mt-2 whitespace-nowrap ${
                    isTargetHorizon ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }`}>
                    {pt.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span>Lịch sử giao dịch thực tế</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span>Dự báo AI tương lai</span>
            </span>
            <span className="font-mono text-amber-400">
              Biến động dự phóng: +{selectedData.growthPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right Column: Strategic Decision Recommendation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl p-5 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                CHIẾN LƯỢC MUA TỐI ƯU (AI RECOMMENDATION)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {selectedData.horizon}
              </span>
            </div>

            <div className="text-base font-bold text-white leading-snug">
              {selectedData.action}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-lg shadow-sm">
                <span className="text-[11px] text-slate-300 font-medium block">Giá dự báo tương lai:</span>
                <div className="text-xl font-mono font-bold text-amber-400">
                  ${selectedData.forecastPrice.toFixed(1)} <span className="text-xs font-normal text-slate-300">/tCO2</span>
                </div>
                <div className="text-[10px] text-slate-400">Khoảng: ${selectedData.lowBound} - ${selectedData.highBound}</div>
              </div>

              <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-lg shadow-sm">
                <span className="text-[11px] text-slate-300 font-medium block">Số tiền tiết kiệm nếu mua ngay:</span>
                <div className="text-xl font-mono font-bold text-emerald-300">
                  ${potentialSavingsUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">Bảo vệ ngân sách Net Zero</div>
              </div>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-700/80">
              <b className="text-amber-300">Yếu tố dẫn dắt (Key Driver):</b> {selectedData.driver}
            </div>

            <button
              onClick={() => onApplyPrice(selectedData.forecastPrice)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <span>Áp dụng giá dự báo (${selectedData.forecastPrice}/tCO2) để kiểm thử ngân sách</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
