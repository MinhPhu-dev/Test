import React, { useState } from 'react';
import { 
  Award, CheckCircle2, ShieldCheck, Printer, 
  FileText, ShoppingCart, TreePine
} from 'lucide-react';
import { EmissionInputs, EmissionResults } from '../types';
import { AIPriceForecasting } from './AIPriceForecasting';

interface TradingHubTabProps {
  inputs: EmissionInputs;
  results: EmissionResults;
  carbonPrice: number;
  setCarbonPrice?: (val: number) => void;
  usdRate: number;
}

export const TradingHubTab: React.FC<TradingHubTabProps> = ({
  inputs,
  results,
  carbonPrice,
  setCarbonPrice,
  usdRate
}) => {
  // Pre-selected package
  const [packageType, setPackageType] = useState<'100' | '75' | '50' | 'custom'>('100');
  const [customTons, setCustomTons] = useState<number>(Math.round(results.totalEmissionTon || 100));
  const [isPurchased, setIsPurchased] = useState<boolean>(false);
  const [purchaseTimestamp, setPurchaseTimestamp] = useState<string>('');

  // Seal image asset
  const sealImg = new URL('/carbon_registry_seal_1790662948000.jpg', import.meta.url).href;
  
  // Calculate offset quantity
  let offsetTons = results.totalEmissionTon;
  let packageName = 'Gói 1: Bù đắp 100% Phát thải (Net Zero Toàn Diện)';
  let targetPct = 100;

  if (packageType === '75') {
    offsetTons = results.totalEmissionTon * 0.75;
    packageName = 'Gói 2: Bù đắp 75% Phát thải (Cam kết ESG Tiên phong)';
    targetPct = 75;
  } else if (packageType === '50') {
    offsetTons = results.totalEmissionTon * 0.50;
    packageName = 'Gói 3: Bù đắp 50% Phát thải (Chuyển dịch Xanh)';
    targetPct = 50;
  } else if (packageType === 'custom') {
    offsetTons = customTons;
    packageName = 'Gói 4: Tùy chỉnh khối lượng tín chỉ';
    targetPct = results.totalEmissionTon > 0 ? Math.min(100, (customTons / results.totalEmissionTon) * 100) : 100;
  }

  // Invoice calculations
  const subtotalUSD = offsetTons * carbonPrice;
  const stewardshipFeeUSD = subtotalUSD * 0.05; // 5% quỹ bảo tồn rừng
  const totalUSD = subtotalUSD + stewardshipFeeUSD;
  const totalVND = totalUSD * usdRate;
  const remainingEmissions = Math.max(0, results.totalEmissionTon - offsetTons);

  // Certificate ID
  const certId = `CG-BLUECARBON-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.abs((inputs.companyName || 'ABC').split('').reduce((a, b) => a + b.charCodeAt(0), 1000) % 9000 + 1000)}`;

  const handlePurchase = () => {
    setIsPurchased(true);
    setPurchaseTimestamp(new Date().toLocaleString('vi-VN'));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
          <span>Sàn Giao Dịch Tín Chỉ Carbon Tự Nguyện (VCM)</span>
          <span aria-hidden="true">·</span>
          <span>Nguồn dự án: Khu DTSQ Rừng ngập mặn Cần Giờ</span>
          <span aria-hidden="true">·</span>
          <span>Cơ chế Retirement tiêu hủy minh bạch</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Sàn Giao Dịch Mô Phỏng & Cấp Chứng Nhận Bù Đắp Net Zero
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Lựa chọn các gói tín chỉ sinh thái Blue Carbon được tạo ra từ rừng ngập mặn Cần Giờ để trung hòa lượng khí thải của doanh nghiệp,
          nhận hóa đơn thanh toán và chứng nhận bù đắp carbon số có mã định danh duy nhất.
        </p>
      </div>

      {/* 1. DỰ BÁO BIẾN ĐỘNG GIÁ TÍN CHỈ BẰNG TRÍ TUỆ NHÂN TẠO (AI PRICE FORECASTING) */}
      <AIPriceForecasting
        currentPrice={carbonPrice}
        totalEmissionTon={results.totalEmissionTon}
        onApplyPrice={(newPrice) => {
          if (setCarbonPrice) {
            setCarbonPrice(newPrice);
          }
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Package Selection & Invoice (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Package Selector */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>1. Lựa Chọn Gói Tín Chỉ Bù Đắp</span>
              </h2>
              <span className="text-xs text-emerald-400 font-mono font-medium">
                ${carbonPrice}/tCO2
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: 100% */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  packageType === '100' 
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-sm' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="package"
                  checked={packageType === '100'}
                  onChange={() => { setPackageType('100'); setIsPurchased(false); }}
                  className="mt-1 accent-emerald-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-white text-sm">Gói 1: Bù đắp 100% (Net Zero Toàn Diện)</span>
                    <span className="font-mono text-emerald-400 font-bold">{results.totalEmissionTon.toFixed(2)} tCO2</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Trung hòa toàn bộ Scope 1 & Scope 2. Đạt chuẩn công bố trung hòa khí hậu cho báo cáo ESG hàng năm.
                  </p>
                </div>
              </label>

              {/* Option 2: 75% */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  packageType === '75' 
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-sm' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="package"
                  checked={packageType === '75'}
                  onChange={() => { setPackageType('75'); setIsPurchased(false); }}
                  className="mt-1 accent-emerald-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-white text-sm">Gói 2: Bù đắp 75% (Cam kết ESG Tiên phong)</span>
                    <span className="font-mono text-teal-400 font-bold">{(results.totalEmissionTon * 0.75).toFixed(2)} tCO2</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Mức cam kết mạnh mẽ cho doanh nghiệp đang trong lộ trình tối ưu hóa thiết bị tiết kiệm năng lượng.
                  </p>
                </div>
              </label>

              {/* Option 3: 50% */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  packageType === '50' 
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-sm' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="package"
                  checked={packageType === '50'}
                  onChange={() => { setPackageType('50'); setIsPurchased(false); }}
                  className="mt-1 accent-emerald-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-white text-sm">Gói 3: Bù đắp 50% (Chuyển dịch Xanh)</span>
                    <span className="font-mono text-blue-400 font-bold">{(results.totalEmissionTon * 0.50).toFixed(2)} tCO2</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Khởi động bù trừ bước đầu, phù hợp với doanh nghiệp vừa và nhỏ làm quen với thị trường carbon.
                  </p>
                </div>
              </label>

              {/* Option 4: Custom */}
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  packageType === 'custom' 
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-sm' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="package"
                  checked={packageType === 'custom'}
                  onChange={() => { setPackageType('custom'); setIsPurchased(false); }}
                  className="mt-1 accent-emerald-500"
                />
                <div className="flex-1 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">Gói 4: Tùy chỉnh khối lượng tín chỉ</span>
                  </div>
                  {packageType === 'custom' && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="1"
                        step="10"
                        value={customTons}
                        onChange={(e) => setCustomTons(Math.max(1, Number(e.target.value)))}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs w-36"
                      />
                      <span className="text-slate-400">tấn CO2</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Simulated Invoice Card */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>2. Hóa Đơn Bù Đắp Mô Phỏng</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Invoice Reference</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800">
                <span>Khối lượng tín chỉ giao dịch:</span>
                <span className="font-mono font-bold text-white">{offsetTons.toFixed(2)} tấn CO2e</span>
              </div>
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800">
                <span>Đơn giá niêm yết sàn Cần Giờ:</span>
                <span className="font-mono text-emerald-400 font-semibold">${carbonPrice.toFixed(2)} / tấn</span>
              </div>
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800">
                <span>Giá trị tín chỉ (Subtotal):</span>
                <span className="font-mono text-white">${subtotalUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800">
                <span>Quỹ quản trị & bảo trợ rừng ngập mặn (5%):</span>
                <span className="font-mono text-teal-400 font-semibold">${stewardshipFeeUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-2 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-white block">Tổng thanh toán:</span>
                  <span className="text-[11px] text-slate-400">Đã bao gồm phí kiểm toán môi trường</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">
                    ${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    ≈ {totalVND.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận Mua Tín Chỉ & Kích Hoạt Chứng Nhận Số</span>
            </button>
          </div>
        </div>

        {/* Right: Digital Certificate Display & Export (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>3. Chứng Nhận Bù Đắp Kỹ Thuật Số (Digital Certificate)</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="In / Lưu PDF chứng nhận"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Certificate Visual Card */}
            <div className="relative bg-slate-950 text-slate-100 rounded-2xl p-6 sm:p-8 border-2 border-emerald-500/60 shadow-2xl overflow-hidden print:bg-white print:text-slate-900 print:m-0 print:border-2">
              {/* Subtle background watermark */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 opacity-5 pointer-events-none">
                <TreePine className="w-full h-full text-emerald-400 print:text-emerald-950" />
              </div>

              {/* Certificate Header */}
              <div className="text-center pb-5 border-b border-slate-800 print:border-slate-200">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 mb-2 print:bg-emerald-50 print:border-emerald-200">
                  <img
                    src={sealImg}
                    alt="Biểu trưng Sàn tín chỉ Cần Giờ"
                    className="w-12 h-12 object-contain rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <h3 className="text-xs uppercase tracking-widest font-extrabold text-emerald-400 print:text-emerald-800">
                  HỆ THỐNG ĐĂNG KÝ BLUE CARBON RỪNG NGẬP MẶN CẦN GIỜ
                </h3>
                <h2 className="text-lg sm:text-xl font-bold text-white print:text-slate-900 mt-1">
                  CHỨNG NHẬN BÙ ĐẮP CARBON KỸ THUẬT SỐ
                </h2>
                <p className="text-[11px] text-slate-400 print:text-slate-500 font-mono mt-0.5">
                  CAN GIO MANGROVE BLUE CARBON RETIREMENT REGISTRY
                </p>
              </div>

              {/* Beneficiary Body */}
              <div className="py-5 text-center space-y-3">
                <p className="text-xs text-slate-300 print:text-slate-600">
                  Chứng nhận xác nhận tổ chức doanh nghiệp:
                </p>
                <div className="text-base sm:text-lg font-bold text-emerald-300 print:text-emerald-900 px-4 py-1.5 bg-emerald-950/70 print:bg-emerald-50/80 rounded-lg inline-block border border-emerald-500/40 print:border-emerald-200">
                  {inputs.companyName || 'Doanh Nghiệp Tiên Phong Net Zero'}
                </div>
                <p className="text-xs text-slate-300 print:text-slate-600">
                  đã tài trợ và bù đắp chính thức khối lượng phát thải khí nhà kính:
                </p>

                {/* Big Metric Badge */}
                <div className="py-2.5 px-4 bg-emerald-600 print:bg-emerald-700 text-white rounded-xl shadow-inner inline-flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums">
                    {offsetTons.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-100">
                    Tấn CO2e (Blue Carbon Credits)
                  </span>
                </div>

                <div className="flex justify-center items-center gap-4 text-xs text-slate-300 print:text-slate-600 pt-1">
                  <div>
                    Tỷ lệ trung hòa: <b className="text-emerald-400 print:text-emerald-700 font-mono">{targetPct.toFixed(1)}%</b>
                  </div>
                  <span>·</span>
                  <div>
                    Phát thải còn lại: <b className="text-slate-200 print:text-slate-800 font-mono">{remainingEmissions.toFixed(2)} tCO2</b>
                  </div>
                </div>
              </div>

              {/* Certificate Metadata Ledger */}
              <div className="pt-4 border-t border-slate-800 print:border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-300 print:text-slate-600 bg-slate-900/90 print:bg-slate-50 p-3 rounded-lg border border-slate-800 print:border-slate-100 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">MÃ TRUY XUẤT CHỨNG CHỈ:</span>
                  <span className="font-bold text-white print:text-slate-800">{certId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">TỌA ĐỘ BẢO TỒN:</span>
                  <span className="text-slate-200 print:text-slate-800">10°22'N, 106°46'E</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">THỜI ĐIỂM TIÊU HỦY (RETIREMENT):</span>
                  <span className="text-slate-200 print:text-slate-800">{purchaseTimestamp || new Date().toLocaleDateString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">TRẠNG THÁI SỔ CÁI:</span>
                  <span className="text-emerald-400 print:text-emerald-700 font-bold">● VĨNH VIỄN KHÓA SỔ</span>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400 print:text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-300 print:text-emerald-800 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-600" />
                  <span>Xác thực bởi Ban Quản lý Khu DTSQ Cần Giờ & Hội đồng Khoa học</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  REF: MONRE/CG-VCM-2026
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                {isPurchased ? 'Đã cấp chứng nhận thành công' : 'Bản xem trước chứng nhận kỹ thuật số'}
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-lg hover:bg-emerald-900 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In / Xuất PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
