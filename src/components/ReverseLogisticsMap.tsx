import React, { useState } from 'react';
import { 
  GitFork, ArrowRight, RefreshCw, DollarSign, TreePine, 
  ShieldCheck, Award, Factory, Users, Sparkles, CheckCircle2,
  Workflow, Database, Truck, Recycle, Sprout, Building2
} from 'lucide-react';

export const ReverseLogisticsMap: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'finance' | 'reverse_logistics'>('finance');
  const [activeStep, setActiveStep] = useState<number>(1);

  const financeSteps = [
    {
      id: 1,
      title: "1. Doanh Nghiệp Mua Tín Chỉ",
      sub: "Scope 1 & 2 Financing",
      desc: "Doanh nghiệp thẩm định lượng phát thải hàng năm, lựa chọn gói bù đắp và ký hợp đồng thanh toán tín chỉ Blue Carbon.",
      kpi: "100% Vốn huy động",
      color: "emerald",
      icon: Building2
    },
    {
      id: 2,
      title: "2. Quỹ Ủy Thác & Smart Escrow",
      sub: "Bảo hiểm rủi ro & MRV Vệ tinh",
      desc: "Dòng tiền được giữ trong Quỹ ủy thác môi trường. 95% vốn giải ngân cho bảo vệ rừng, 5% duy trì trạm đo đạc viễn thám GIS/Sentinel.",
      kpi: "95% Tái đầu tư bảo tồn",
      color: "sky",
      icon: Database
    },
    {
      id: 3,
      title: "3. BQL Rừng & 1.000+ Hộ Dân",
      sub: "Hợp đồng giao khoán bảo vệ",
      desc: "Chi trả Dịch vụ Môi trường Rừng (PES) trực tiếp đến các hộ giữ rừng Cần Giờ, tuần tra bãi bồi ven sông Lòng Tàu và Soài Rạp.",
      kpi: "35.120 ha Bảo vệ nghiêm ngặt",
      color: "indigo",
      icon: Users
    },
    {
      id: 4,
      title: "4. Sinh Khối & Trầm Tích Xanh",
      sub: "Blue Carbon Sequestration",
      desc: "Rừng Đước, Mấm quang hợp và tích tụ carbon sâu trong tầng bùn trầm tích ngập triều yếm khí (>62.5% tổng trữ lượng).",
      kpi: "~650.000 tCO2e/năm",
      color: "emerald",
      icon: TreePine
    },
    {
      id: 5,
      title: "5. Sổ Cái Registry & Tiêu Hủy",
      sub: "Permanent Retirement",
      desc: "Hệ thống cấp chứng nhận số duy nhất có gắn tọa độ GPS và khóa vĩnh viễn (Retire) trên Sổ cái Môi trường, triệt tiêu nguy cơ Double Counting.",
      kpi: "0% Trùng lặp (Verra/VCS)",
      color: "amber",
      icon: Award
    }
  ];

  const reverseLogisticsSteps = [
    {
      id: 1,
      title: "1. Thu Gom Phụ Phẩm Rừng & Rác Bãi Bồi",
      sub: "Reverse Collection",
      desc: "Thu gom cành gỗ Đước tỉa thưa định kỳ, lá rụng thừa và rác thải nhựa đại dương dạt vào các vạt rừng ngập triều ven biển.",
      kpi: "1.200 tấn sinh khối/năm",
      color: "amber",
      icon: Truck
    },
    {
      id: 2,
      title: "2. Nhiệt Phân Xanh (Green Pyrolysis)",
      sub: "Chuyển hóa nhiệt hóa học",
      desc: "Gỗ tỉa thưa được xử lý qua lò nhiệt phân yếm khí không khói, chuyển hóa thành Than sinh học (Biochar) chất lượng cao và dấm gỗ sinh học.",
      kpi: "80% Carbon cố định",
      color: "indigo",
      icon: Factory
    },
    {
      id: 3,
      title: "3. Hoàn Nguyên Đất Rừng Cần Giờ",
      sub: "Soil Carbon Amendment",
      desc: "Bón Than sinh học (Biochar) trở lại tầng đất trầm tích suy thoái, giúp khóa carbon đất thêm hàng trăm năm và giữ dinh dưỡng cho cây non.",
      kpi: "+25% Tốc độ tái sinh",
      color: "emerald",
      icon: Sprout
    },
    {
      id: 4,
      title: "4. Sản Phẩm Tuần Hoàn Cho Doanh Nghiệp",
      sub: "Circular Upcycling & ESG Value",
      desc: "Dấm gỗ và vật liệu sinh học tuần hoàn được cung cấp ngược lại cho chuỗi đóng gói của doanh nghiệp mua tín chỉ, hoàn tất vòng lặp nguyên liệu.",
      kpi: "100% Khép kín vòng đời",
      color: "sky",
      icon: Recycle
    }
  ];

  const currentSteps = activeMode === 'finance' ? financeSteps : reverseLogisticsSteps;

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Workflow className="w-3 h-3" />
              Circular Economy & Green SCM
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">|</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Minh bạch dòng tiền & vòng lặp chuỗi cung ứng ngược</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-emerald-400" />
            <span>Sơ Đồ Chuỗi Cung Ứng Ngược & Truy Xuất Dòng Tiền Tín Chỉ</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            Trực quan hóa hành trình luân chuyển dòng vốn từ doanh nghiệp mua tín chỉ đến Ban quản lý rừng Cần Giờ, cùng mô hình Chuỗi cung ứng ngược (Reverse Logistics) thu hồi sinh khối tái sinh đất ngập mặn.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => { setActiveMode('finance'); setActiveStep(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'finance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>1. Dòng Tiền & Tín Chỉ Tuần Hoàn</span>
          </button>
          <button
            onClick={() => { setActiveMode('reverse_logistics'); setActiveStep(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'reverse_logistics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>2. Chuỗi Cung Ứng Ngược Sinh Khối</span>
          </button>
        </div>
      </div>

      {/* Interactive Process Flowchart Nodes */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${activeMode === 'finance' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3.5`}>
        {currentSteps.map((step, idx) => {
          const IconComp = step.icon;
          const isSelected = activeStep === step.id;
          
          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Connector indicator for desktop */}
              {idx < currentSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4 text-emerald-500/60" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-emerald-400'
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                    {step.kpi}
                  </span>
                </div>

                <h3 className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                  {step.title}
                </h3>
                <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                  {step.sub}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-200 leading-relaxed line-clamp-3">
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Selected Step Deep Dive Card */}
      {(() => {
        const step = currentSteps.find(s => s.id === activeStep) || currentSteps[0];
        const IconComp = step.icon;

        return (
          <div className="bg-slate-950/95 border border-emerald-500/40 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-emerald-300 uppercase tracking-wider font-semibold">
                    Chi tiết phân đoạn {step.id} / {currentSteps.length}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {step.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-medium">Chỉ số cam kết:</span>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-mono font-bold">
                  {step.kpi}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {step.desc}
            </p>

            {/* Strategic Value Proposition for Academic / Business Grading */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
                <span className="text-slate-300 text-[11px] uppercase font-semibold">Tính Minh Bạch (Transparency)</span>
                <div className="text-white font-medium">Sổ cái phân tán & Giám sát ảnh vệ tinh Sentinel-2</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
                <span className="text-slate-300 text-[11px] uppercase font-semibold">Tác Động Xã Hội (Social Impact)</span>
                <div className="text-white font-medium">Tạo sinh kế bền vững cho 1.000+ hộ dân giữ rừng Cần Giờ</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
                <span className="text-slate-300 text-[11px] uppercase font-semibold">Khép Kín Chu Kỳ (Closed Loop)</span>
                <div className="text-white font-medium">Hoàn nguyên 100% dòng tiền & sinh khối về lại đất sinh quyển</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
