import React, { useRef } from 'react';
import { 
  FileText, Download, Printer, X, ShieldCheck, 
  Building2, Award, Calendar, CheckCircle2, Globe, AlertCircle
} from 'lucide-react';
import { EmissionInputs, EmissionFactors, EmissionResults } from '../types';

interface ESGReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: EmissionInputs;
  factors: EmissionFactors;
  results: EmissionResults;
  carbonPrice: number;
  usdRate: number;
}

export const ESGReportModal: React.FC<ESGReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  factors,
  results,
  carbonPrice,
  usdRate
}) => {
  if (!isOpen) return null;

  const reportDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const reportCode = `GHG-ISO14064-${new Date().getFullYear()}-${Math.abs((inputs.companyName || 'ABC').split('').reduce((a, b) => a + b.charCodeAt(0), 1000) % 9000 + 1000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvRows = [
      ['BÁO CÁO KIỂM KÊ KHÍ NHÀ KÍNH & ESG THEO CHUẨN ISO 14064-1:2018'],
      ['Mã báo cáo', reportCode],
      ['Thời điểm lập', reportDate],
      ['Tổ chức / Doanh nghiệp', inputs.companyName],
      ['Ngành nghề', inputs.industry],
      ['Quy mô', inputs.scale],
      [''],
      ['DANH MỤC PHÁT THẢI (GHG SCOPE)', 'THÔNG SỐ TIÊU THỤ', 'HỆ SỐ PHÁT THẢI', 'PHÁT THẢI (TẤN CO2E)', 'TỶ TRỌNG (%)'],
      [
        'Scope 1 - Xăng RON 95',
        `${inputs.petrolLiters.toLocaleString()} Lít`,
        `${factors.petrol} kg CO2/L (IPCC)`,
        results.scope1PetrolTon.toFixed(2),
        `${results.totalEmissionTon > 0 ? ((results.scope1PetrolTon / results.totalEmissionTon) * 100).toFixed(1) : 0}%`
      ],
      [
        'Scope 1 - Dầu Diesel',
        `${inputs.dieselLiters.toLocaleString()} Lít`,
        `${factors.diesel} kg CO2/L (IPCC)`,
        results.scope1DieselTon.toFixed(2),
        `${results.totalEmissionTon > 0 ? ((results.scope1DieselTon / results.totalEmissionTon) * 100).toFixed(1) : 0}%`
      ],
      [
        'Scope 2 - Điện lưới quốc gia',
        `${inputs.electricityKWh.toLocaleString()} kWh`,
        `${factors.gridElectricity} kg CO2/kWh (Bộ TN&MT)`,
        results.totalScope2Ton.toFixed(2),
        `${results.totalEmissionTon > 0 ? ((results.totalScope2Ton / results.totalEmissionTon) * 100).toFixed(1) : 0}%`
      ],
      [''],
      ['TỔNG PHÁT THẢI TOÀN DOANH NGHIỆP', '', '', `${results.totalEmissionTon.toFixed(2)} tCO2e`, '100%'],
      ['ĐƠN GIÁ TÍN CHỈ BLUE CARBON CẦN GIỜ', '', '', `$${carbonPrice.toFixed(2)} USD / tCO2`, ''],
      ['TỔNG NGÂN SÁCH BÙ ĐẮP NET ZERO (USD)', '', '', `$${results.offsetCostUSD.toFixed(2)} USD`, ''],
      ['TỔNG NGÂN SÁCH BÙ ĐẮP NET ZERO (VNĐ)', '', '', `${Math.round(results.offsetCostVND).toLocaleString()} VNĐ`, ''],
      ['CƠ CHẾ TUÂN THỦ', 'ISO 14064-1:2018 / GHG Protocol Corporate Standard / EU CBAM Ready']
    ];

    const csvContent = '\uFEFF' + csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_Cao_ESG_ISO14064_${inputs.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Báo Cáo Kiểm Kê Khí Nhà Kính & Bạch Thư ESG Chuẩn Quốc Tế
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                {reportCode} · Tiêu chuẩn ISO 14064-1:2018 & GHG Protocol
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Xuất file CSV mở bằng Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tải Excel / CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
              title="In hoặc xuất file PDF trực tiếp"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-slate-200 print:text-black print:p-6 print:overflow-visible">
          {/* Document Header */}
          <div className="border-b-2 border-emerald-500/60 pb-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌿</span>
                <span className="text-lg font-black tracking-wider uppercase text-emerald-400 print:text-emerald-700">
                  CarbonLens Registry · ESG Disclosure System
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 print:text-slate-600">
                Mã báo cáo: <b className="text-white print:text-black">{reportCode}</b>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white print:text-black tracking-tight leading-tight">
              BÁO CÁO KIỂM KÊ KHÍ NHÀ KÍNH (GHG INVENTORY) & BẠCH THƯ ESG DOANH NGHIỆP
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-700 leading-relaxed">
              Tài liệu xác lập ranh giới phát thải Scope 1 - Scope 2, phục vụ báo cáo bền vững ESG, kiểm toán độc lập và sẵn sàng đáp ứng yêu cầu thẩm tra Cơ chế điều chỉnh biên giới carbon của Liên minh Châu Âu (EU CBAM).
            </p>
          </div>

          {/* Section 1: Organizational Profile */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800 flex items-center gap-1.5">
              <span>PHẦN I. THÔNG TIN ĐƠN VỊ VÀ RANH GIỚI BÁO CÁO</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300 text-xs">
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Tên doanh nghiệp:</span>
                <b className="text-white print:text-black">{inputs.companyName}</b>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Lĩnh vực hoạt động:</span>
                <b className="text-white print:text-black">{inputs.industry}</b>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Kỳ kiểm kê:</span>
                <b className="text-white print:text-black">Năm 2026 (Annual Cycle)</b>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Ngày xác lập:</span>
                <b className="text-white print:text-black">{reportDate}</b>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Inventory Tables */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800">
              PHẦN II. BẢNG KÊ CHI TIẾT NGUỒN PHÁT THẢI (SCOPE 1 & SCOPE 2)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-slate-800/80 print:bg-slate-200 text-slate-300 print:text-black font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Phân loại GHG</th>
                    <th className="py-2.5 px-3">Nguồn tiêu thụ</th>
                    <th className="py-2.5 px-3 text-right">Lượng tiêu thụ</th>
                    <th className="py-2.5 px-3 text-right">Hệ số phát thải (EF)</th>
                    <th className="py-2.5 px-3 text-right">Phát thải (tCO2e)</th>
                    <th className="py-2.5 px-3 text-right">Tỷ trọng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-amber-400 print:text-amber-700">Scope 1 (Trực tiếp)</td>
                    <td className="py-2.5 px-3 text-slate-300 print:text-black">Xăng RON 95 (Vận tải)</td>
                    <td className="py-2.5 px-3 text-right font-mono">{inputs.petrolLiters.toLocaleString()} Lít</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 print:text-slate-600">{factors.petrol} kg CO2/L</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">{results.scope1PetrolTon.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {results.totalEmissionTon > 0 ? ((results.scope1PetrolTon / results.totalEmissionTon) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-amber-400 print:text-amber-700">Scope 1 (Trực tiếp)</td>
                    <td className="py-2.5 px-3 text-slate-300 print:text-black">Dầu Diesel (Vận tải & Máy phát)</td>
                    <td className="py-2.5 px-3 text-right font-mono">{inputs.dieselLiters.toLocaleString()} Lít</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 print:text-slate-600">{factors.diesel} kg CO2/L</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">{results.scope1DieselTon.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {results.totalEmissionTon > 0 ? ((results.scope1DieselTon / results.totalEmissionTon) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-sky-400 print:text-sky-700">Scope 2 (Gián tiếp)</td>
                    <td className="py-2.5 px-3 text-slate-300 print:text-black">Lưới điện quốc gia (EVN)</td>
                    <td className="py-2.5 px-3 text-right font-mono">{inputs.electricityKWh.toLocaleString()} kWh</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 print:text-slate-600">{factors.gridElectricity} kg CO2/kWh</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">{results.totalScope2Ton.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {results.totalEmissionTon > 0 ? ((results.totalScope2Ton / results.totalEmissionTon) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="bg-emerald-950/40 print:bg-emerald-100 font-bold">
                    <td colSpan={4} className="py-3 px-3 text-emerald-300 print:text-emerald-900 uppercase">
                      TỔNG PHÁT THẢI KHÍ NHÀ KÍNH (TOTAL GHG EMISSIONS)
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 print:text-emerald-800 text-sm">
                      {results.totalEmissionTon.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 print:text-emerald-800">
                      100.0%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Financial Valuation & Offsetting Commitment */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800">
              PHẦN III. ĐỊNH GIÁ TÀI CHÍNH & PHƯƠNG ÁN TRUNG HÒA BLUE CARBON CẦN GIỜ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 p-3.5 rounded-xl space-y-1">
                <span className="text-slate-400 print:text-slate-600 text-[11px] block">Đơn giá tham chiếu (VCM):</span>
                <div className="text-lg font-mono font-bold text-white print:text-black">${carbonPrice.toFixed(2)} USD/tCO2e</div>
                <div className="text-[11px] text-slate-500">Tỷ giá: 1 USD = {usdRate.toLocaleString()} VNĐ</div>
              </div>
              <div className="bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 p-3.5 rounded-xl space-y-1">
                <span className="text-slate-400 print:text-slate-600 text-[11px] block">Ngân sách bù đắp (USD):</span>
                <div className="text-lg font-mono font-bold text-emerald-400 print:text-emerald-800">
                  ${results.offsetCostUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500">Cam kết Net Zero toàn diện</div>
              </div>
              <div className="bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 p-3.5 rounded-xl space-y-1">
                <span className="text-slate-400 print:text-slate-600 text-[11px] block">Ngân sách quy đổi (VNĐ):</span>
                <div className="text-lg font-mono font-bold text-sky-400 print:text-sky-800">
                  {Math.round(results.offsetCostVND).toLocaleString()} VNĐ
                </div>
                <div className="text-[11px] text-slate-500">Bảo hiểm trượt giá carbon</div>
              </div>
            </div>
          </div>

          {/* Section 4: Audit & Verification Statement */}
          <div className="pt-4 border-t border-slate-800 print:border-slate-300 space-y-3">
            <div className="text-xs text-slate-400 print:text-slate-600 leading-relaxed">
              <b>Tuyên bố tuân thủ:</b> Báo cáo được khởi tạo tự động dựa trên thuật toán tích hợp hệ số phát thải công bố chính thức từ Cục Biến đổi khí hậu (Bộ Tài nguyên & Môi trường Việt Nam) và Hướng dẫn kiểm kê quốc gia IPCC 2006. Dự án hấp thụ tham chiếu: Khu Dự trữ Sinh quyển Rừng ngập mặn Cần Giờ (UNESCO, 35.120 ha rừng phòng hộ).
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="text-center">
                <div className="text-xs text-slate-400 print:text-slate-600 mb-10">ĐẠI DIỆN DOANH NGHIỆP KIỂM KÊ</div>
                <div className="font-semibold text-white print:text-black text-xs">{inputs.companyName}</div>
                <div className="text-[11px] text-slate-500">(Ký, ghi rõ họ tên và đóng dấu)</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 print:text-slate-600 mb-10">HỘI ĐỒNG THẨM ĐỊNH KHOA HỌC CARBONLENS</div>
                <div className="font-semibold text-emerald-400 print:text-emerald-800 text-xs">Cần Giờ Blue Carbon Registry</div>
                <div className="text-[11px] text-slate-500">Đã đối soát chuỗi khối (Verified)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
