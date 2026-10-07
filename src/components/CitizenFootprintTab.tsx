import React, { useState } from 'react';
import { 
  User, TreePine, Car, Zap, Utensils, HeartHandshake, 
  Award, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, 
  TrendingDown, Info, Lock, Share2
} from 'lucide-react';

interface CitizenFootprintTabProps {
  onSwitchToCorporate?: () => void;
}

export const CitizenFootprintTab: React.FC<CitizenFootprintTabProps> = ({ onSwitchToCorporate }) => {
  // Input states for individual footprint
  const [transportMode, setTransportMode] = useState<'motorbike' | 'car_gas' | 'car_ev' | 'bus'>('motorbike');
  const [kmPerDay, setKmPerDay] = useState<number>(20);
  const [electricityKWhMonth, setElectricityKWhMonth] = useState<number>(180);
  const [dietType, setDietType] = useState<'meat_heavy' | 'balanced' | 'vegetarian'>('balanced');
  const [flightsPerYear, setFlightsPerYear] = useState<number>(1);

  // Community tree planting sponsorship
  const [treesDonated, setTreesDonated] = useState<number>(2);
  const [isSponsored, setIsSponsored] = useState(false);
  const [citizenName, setCitizenName] = useState('Trần Hoàng Nam');

  // Emission Factors (kgCO2)
  // Transport kgCO2 per km
  const transportFactors = {
    motorbike: 0.055, // 55g/km
    car_gas: 0.170,   // 170g/km
    car_ev: 0.065,    // 65g/km with VN grid
    bus: 0.035        // 35g/km
  };

  // Diet tons CO2 per year
  const dietFactors = {
    meat_heavy: 2.1,
    balanced: 1.4,
    vegetarian: 0.8
  };

  // Annual calculation
  const annualTransportTon = (kmPerDay * 365 * transportFactors[transportMode]) / 1000;
  const annualElectricityTon = (electricityKWhMonth * 12 * 0.7221) / 1000;
  const annualDietTon = dietFactors[dietType];
  const annualFlightTon = flightsPerYear * 0.22; // ~220 kg per domestic return flight

  const totalPersonalFootprintTon = annualTransportTon + annualElectricityTon + annualDietTon + annualFlightTon;
  const vnAverageTon = 1.80; // VN national average per capita
  const deltaVsAverage = ((totalPersonalFootprintTon - vnAverageTon) / vnAverageTon) * 100;

  // Tree absorption: ~25 kg CO2/year per mangrove Rhizophora tree
  const treeAbsorptionPerYearKg = 25;
  const treeAbsorptionTon = (treesDonated * treeAbsorptionPerYearKg) / 1000;
  const treeCostVND = treesDonated * 25000;
  const offsetPercentage = Math.min(100, (treeAbsorptionTon / totalPersonalFootprintTon) * 100);

  const handleSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSponsored(true);
    setTimeout(() => {
      window.scrollTo({ top: 900, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-500/40">
                NHÓM 3 · CÁ NHÂN & NGƯỜI TIÊU DÙNG THÔNG THƯỜNG
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300">Công dân Net Zero</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              <span>Tra Cứu Dấu Chân Carbon Cá Nhân & Góp Cây Giữ Rừng Cần Giờ</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Đo lường lượng phát thải từ thói quen sinh hoạt, đi lại hàng ngày và chung tay cùng 1.000+ hộ dân bảo tồn rừng ngập mặn Cần Giờ thông qua chương trình đóng góp cây xanh cộng đồng.
            </p>
          </div>

          {/* Locked notice pill */}
          <div className="p-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Sàn Giao Dịch Carbon B2B: Bị Khóa</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Chỉ dành cho Doanh nghiệp kiểm kê Scope 1 & 2.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Summary Footprint Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dấu chân Carbon cá nhân</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {totalPersonalFootprintTon.toFixed(2)} <span className="text-xs text-slate-400">tCO2/năm</span>
          </div>
          <div className="text-[11px] text-slate-300">
            {deltaVsAverage > 0 ? (
              <span className="text-rose-400">Cao hơn {deltaVsAverage.toFixed(0)}% so với trung bình VN</span>
            ) : (
              <span className="text-emerald-400">Thấp hơn {Math.abs(deltaVsAverage).toFixed(0)}% so với trung bình VN</span>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mức trung bình người Việt</span>
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            1.80 <span className="text-xs text-slate-400">tCO2/năm</span>
          </div>
          <div className="text-[11px] text-slate-400">Mục tiêu Paris 2030: &lt;1.5 tCO2</div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cây Đước nhận bảo trợ</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {treesDonated} <span className="text-xs text-slate-400">cây</span>
          </div>
          <div className="text-[11px] text-emerald-300">
            Hấp thụ ~{(treeAbsorptionTon * 1000).toFixed(0)} kg CO2/năm
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tỷ lệ trung hòa qua rừng</span>
            <TrendingDown className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {offsetPercentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-300">Đóng góp trực tiếp Quỹ PES Cần Giờ</div>
        </div>
      </div>

      {/* Main Grid: Footprint Calculator + Mangrove Sponsorship */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Calculator (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1. Khảo Sát Dấu Chân Carbon Sinh Hoạt (Personal Calculator)</span>
              </h3>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                Tính toán thời gian thực
              </span>
            </div>

            {/* Question 1: Phương tiện di chuyển */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phương tiện đi lại chính của bạn hàng ngày:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'motorbike', label: 'Xe máy xăng', sub: '55g CO2/km' },
                  { id: 'car_gas', label: 'Ô tô xăng', sub: '170g CO2/km' },
                  { id: 'car_ev', label: 'Xe điện (EV)', sub: '65g CO2/km' },
                  { id: 'bus', label: 'Xe buýt / Metro', sub: '35g CO2/km' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTransportMode(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      transportMode === item.id
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>

              {/* Slider Km/day */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Quãng đường di chuyển trung bình:</span>
                  <span className="font-mono text-emerald-400 font-bold">{kmPerDay} km/ngày</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={kmPerDay}
                  onChange={(e) => setKmPerDay(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Question 2: Điện sinh hoạt gia đình */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Tiêu thụ điện sinh hoạt gia đình (kWh/tháng):</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="800"
                  step="20"
                  value={electricityKWhMonth}
                  onChange={(e) => setElectricityKWhMonth(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="font-mono text-xs font-bold text-amber-400 w-24 text-right">
                  {electricityKWhMonth} kWh
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Tương đương: ~{((electricityKWhMonth * 12 * 0.7221) / 1000).toFixed(2)} tCO2/năm (Hệ số lưới điện VN 0.7221 kg/kWh)
              </div>
            </div>

            {/* Question 3: Thói quen ăn uống */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-rose-400" />
                <span>Chế độ dinh dưỡng phổ biến:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'meat_heavy', label: 'Nhiều thịt bò/đỏ', ton: '2.1 tCO2/năm' },
                  { id: 'balanced', label: 'Cân bằng (Thịt & Rau)', ton: '1.4 tCO2/năm' },
                  { id: 'vegetarian', label: 'Ăn chay / Thực vật', ton: '0.8 tCO2/năm' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDietType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      dietType === item.id
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.ton}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Breakdown summary */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
                Phân tích cơ cấu phát thải hàng năm của bạn:
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block">Đi lại:</span>
                  <span className="text-white font-bold">{annualTransportTon.toFixed(2)} t</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Điện nhà:</span>
                  <span className="text-amber-400 font-bold">{annualElectricityTon.toFixed(2)} t</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Ăn uống:</span>
                  <span className="text-rose-400 font-bold">{annualDietTon.toFixed(2)} t</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Community Tree Planting (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mangrove Sponsorship Box */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>2. Chương Trình: "Góp Cây Giữ Rừng Cần Giờ"</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                Cộng đồng Net Zero
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Mỗi cá nhân có thể nhận đỡ đầu và tài trợ trồng cây Đước đôi (Rhizophora apiculata) tại bãi bồi Cần Giờ. Chi phí được chuyển thẳng vào Quỹ PES hỗ trợ hộ dân giữ rừng.
            </p>

            <form onSubmit={handleSponsor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Họ tên người nhận chứng nhận sống xanh:
                </label>
                <input
                  type="text"
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Số lượng cây Đước đóng góp:</span>
                  <span className="font-mono text-emerald-400 font-bold">{treesDonated} cây</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[1, 2, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTreesDonated(num)}
                      className={`py-1.5 rounded-lg border text-xs font-bold font-mono transition-all ${
                        treesDonated === num
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {num} cây
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Mức đóng góp (25.000đ/cây):</span>
                  <span className="text-white font-bold">{treeCostVND.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Lượng carbon hấp thụ bù trừ:</span>
                  <span className="text-emerald-400 font-bold">~{(treesDonated * 25)} kg CO2/năm</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hỗ trợ trực tiếp:</span>
                  <span className="text-sky-400">1.000+ hộ dân Cần Giờ</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Xác Nhận Đóng Góp & Nhận Chứng Nhận Sống Xanh</span>
              </button>
            </form>
          </div>

          {/* Locked B2B Trading explanation card */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Lock className="w-4 h-4" />
              <span>Tại sao Sàn Giao Dịch Carbon B2B bị khóa với Cá nhân?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Theo quy định quốc tế và Nghị định 06/2022/NĐ-CP, tín chỉ Blue Carbon Cần Giờ trên sàn mô phỏng được phát hành theo lô lớn (tối thiểu 10 tCO2) phục vụ bù trừ bắt buộc cho doanh nghiệp có nghĩa vụ kiểm kê. Cá nhân tham gia thông qua hình thức đỡ đầu cây xanh và lối sống giảm rác thải.
            </p>
            {onSwitchToCorporate && (
              <button
                onClick={onSwitchToCorporate}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 pt-1"
              >
                <span>Chuyển sang tài khoản Doanh nghiệp để trải nghiệm Sàn giao dịch B2B</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Citizen Certificate Card (Displays when sponsored) */}
      {isSponsored && (
        <div className="bg-slate-950 border-2 border-emerald-500/60 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 mb-1">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-emerald-400 font-extrabold font-mono">
              HỆ THỐNG GHI NHẬN CỘNG ĐỒNG RỪNG NGẬP MẶN CẦN GIỜ
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              CHỨNG NHẬN CÔNG DÂN TIÊN PHONG SỐNG XANH
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              CAN GIO CITIZEN GREEN COMMITMENT CERTIFICATE
            </p>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="text-slate-300">Chứng nhận trân trọng ghi nhận:</div>
            <div className="text-base font-bold text-emerald-400">{citizenName}</div>
            <div className="text-slate-300">
              Đã nhận bảo trợ đóng góp <b className="text-white">{treesDonated} cây Đước đôi</b> tại bãi bồi Cần Giờ, giúp hấp thụ trung hòa ước tính <b className="text-emerald-400">~{treesDonated * 25} kg CO2/năm</b>.
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
            <span>Mã ghi nhận: CG-CITIZEN-{Date.now().toString().slice(-6)}</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Đã ghi vào Sổ cái Xanh
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
