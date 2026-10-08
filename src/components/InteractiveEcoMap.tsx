import React, { useState } from 'react';
import { TreePine, Layers, Eye, ShieldCheck, Info } from 'lucide-react';
import { CAN_GIO_ZONES } from '../constants/scienceData';

export const InteractiveEcoMap: React.FC = () => {
  // Mặc định chọn phân khu đầu tiên trong danh sách dữ liệu thực tế của bạn
  const [activeZoneName, setActiveZoneName] = useState<string>(CAN_GIO_ZONES[0].name);
  const [mapLayer, setMapLayer] = useState<'satellite' | 'biomass' | 'absorption'>('biomass');

  const selectedZone = CAN_GIO_ZONES.find(z => z.name === activeZoneName) || CAN_GIO_ZONES[0];
  
  // Phân giải phép tính biểu thức số an toàn
  const currentArea = selectedZone.areaHa;
  const simulatedAbsorption = currentArea * 18.5;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header điều khiển bản đồ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Hệ Thống Trực Quan Hóa Vệ Tinh & Sinh Khối Số</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dữ liệu GIS trực quan tích hợp viễn thám độ phân giải cao trích xuất mật độ Carbon Xanh vùng ngập mặn
          </p>
        </div>

        {/* Chuyển đổi lớp bản đồ */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${mapLayer === 'satellite' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'}`}
          >
            Vệ tinh tự nhiên
          </button>
          <button
            onClick={() => setMapLayer('biomass')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${mapLayer === 'biomass' ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            Mật độ sinh khối
          </button>
          <button
            onClick={() => setMapLayer('absorption')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${mapLayer === 'absorption' ? 'bg-sky-950 border border-sky-500/30 text-sky-400' : 'text-slate-400 hover:text-white'}`}
          >
            Hấp thụ tCO2
          </button>
        </div>
      </div>

      {/* Thân bản đồ chính */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Khối hiển thị Bản đồ Địa lý động (7 cột) */}
        <div className="lg:col-span-7 relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 h-80 lg:h-96">
          
          {/* RENDER SƠ ĐỒ MÔ PHỎNG VỊ TRÍ HÌNH HỌC */}
          <div className="absolute inset-0 z-0 w-full h-full bg-slate-950">
            {/* Nền lưới tọa độ */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Các nhánh sông */}
            <div className="absolute top-[20%] left-[20%] w-[60%] h-[5px] bg-gradient-to-r from-sky-600 via-teal-500 to-transparent blur-[1px] transform rotate-12" />
            <div className="absolute top-[40%] left-[30%] w-[50%] h-[7px] bg-gradient-to-r from-blue-600 via-sky-500 to-transparent blur-[1px] transform -rotate-12" />
            
            {/* Các lớp màu phủ tầng sinh quyển khi lọc dữ liệu */}
            <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${mapLayer === 'biomass' ? 'opacity-30' : 'opacity-0'}`}>
              <div className="absolute top-[25%] left-[35%] w-32 h-32 rounded-full bg-emerald-500 blur-3xl" />
              <div className="absolute top-[40%] left-[50%] w-40 h-40 rounded-full bg-green-500 blur-3xl" />
            </div>
            <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${mapLayer === 'absorption' ? 'opacity-25' : 'opacity-0'}`}>
              <div className="absolute top-[25%] left-[35%] w-36 h-36 rounded-full bg-sky-500 blur-3xl" />
              <div className="absolute top-[45%] left-[45%] w-32 h-32 rounded-full bg-blue-500 blur-3xl" />
            </div>

            {/* Khớp nối 4 phân khu dữ liệu thực tế */}
            {CAN_GIO_ZONES.map((zone, idx) => (
              <button
                key={zone.name}
                onClick={() => setActiveZoneName(zone.name)}
                className={`absolute transition-all duration-300 p-2 rounded-xl border shadow-xl flex items-center gap-1.5 group/pin text-[11px] font-bold ${
                  zone.name === activeZoneName
                    ? 'bg-emerald-500 border-white text-slate-950 scale-105 z-20 shadow-emerald-500/20'
                    : mapLayer === 'biomass'
                      ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-400 hover:scale-105'
                      : 'bg-sky-950/90 border-sky-500/40 text-sky-400 hover:scale-105'
                }`}
                style={{
                  top: idx === 0 ? '25%' : idx === 1 ? '45%' : idx === 2 ? '65%' : '15%',
                  left: idx === 0 ? '25%' : idx === 1 ? '40%' : idx === 2 ? '48%' : '52%',
                }}
              >
                <TreePine className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[90px] sm:max-w-none">
                  {zone.name.replace('Phân khu ', '')}
                </span>
              </button>
            ))}
          </div>
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 max-w-[210px] text-xs font-sans space-y-1.5 shadow-2xl z-10">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Chú giải bản đồ:</div>
            {mapLayer === 'biomass' ? (
              <div className="space-y-1 font-medium text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded bg-emerald-500 block"></span>Mật độ rất cao (&gt;400t/ha)</div>
                <div className="flex items-center gap-1.5 text-emerald-500"><span className="w-2.5 h-2.5 rounded bg-emerald-600 block"></span>Mật độ trung bình</div>
              </div>
            ) : mapLayer === 'satellite' ? (
              <div className="text-slate-300 italic text-[11px] flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Kênh viễn thám thực tế RGB
              </div>
            ) : (
              <div className="space-y-1 font-medium text-[11px]">
                <div className="flex items-center gap-1.5 text-sky-400"><span className="w-2.5 h-2.5 rounded bg-sky-500 block"></span>Hấp thụ sinh khối mạnh</div>
                <div className="flex items-center gap-1.5 text-sky-500"><span className="w-2.5 h-2.5 rounded bg-sky-700 block"></span>Vành đai bãi bồi cửa sông</div>
              </div>
            )}
          </div>
        </div>

        {/* Khối hiển thị số liệu tương ứng */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-inner">
          <div className="space-y-3">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[9px] px-2 py-0.5 rounded-md font-mono border font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                Hệ Sinh Thái Blue Carbon
              </span>
              <h4 className="text-sm font-bold text-white mt-1.5 tracking-tight leading-tight">{selectedZone.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1.5 italic leading-relaxed">"{selectedZone.description}"</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-2.5">
                <div className="text-slate-500 text-[10px] font-mono uppercase">Diện tích phân khu</div>
                <div className="text-sm font-bold text-white mt-0.5 font-mono">{selectedZone.areaHa.toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400 font-sans font-normal">ha</span></div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-2.5">
                <div className="text-slate-500 text-[10px] font-mono uppercase">Mật độ trữ lượng</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">{selectedZone.carbonDensityTonPerHa} <span className="text-[10px] text-slate-400 font-sans font-normal">t/ha</span></div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Thành phần quần thể thực vật</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex flex-col gap-1 text-slate-400">
                  <span>Loài cây ưu thế vùng ngập triều:</span>
                  <span className="text-white font-medium pl-2 border-l-2 border-slate-800 leading-relaxed">
                    {selectedZone.dominantSpecies}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 text-center space-y-0.5 shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Năng suất hấp thụ phân khu ước tính</span>
            <div className="text-xl font-black text-emerald-400 font-mono tracking-tight tabular-nums">
              {Math.round(simulatedAbsorption).toLocaleString('vi-VN')}
              <span className="text-xs text-slate-300 font-sans font-normal ml-1">tCO2e/năm</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Khấu trừ biên độ an toàn chuẩn quốc tế</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
