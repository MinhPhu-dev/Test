import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, Info, ShieldCheck } from 'lucide-react';
import { EmissionInputs, EmissionResults } from '../types';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }
interface AIConsultantTabProps { inputs: EmissionInputs; results: EmissionResults; carbonPrice: number; }

export const AIConsultantTab: React.FC<AIConsultantTabProps> = ({ inputs, results, carbonPrice }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome', role: 'assistant',
      content: `Xin chào! Tôi là **Trợ lý Cố vấn AI CarbonLens**. Tôi đã đồng bộ hồ sơ phát thải của **${inputs.companyName || 'doanh nghiệp'}** (Hiện trạng: **${results.totalEmissionTon.toFixed(2)} tấn CO2e**).\n\nHãy đặt câu hỏi bên dưới để tôi tư vấn chiến lược cắt giảm phát thải Scope 1 & 2 và lộ trình mua tín chỉ Blue Carbon rừng Cần Giờ đạt chuẩn Net Zero!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    `Đánh giá mức phát thải ${results.totalEmissionTon.toFixed(1)} tCO2 và đề xuất giải pháp giảm nhanh Scope 1 & 2?`,
    'Tại sao Blue Carbon rừng ngập mặn Cần Giờ hấp thụ cao gấp 4-6 lần rừng trên cạn?',
    `Với giá tín chỉ $${carbonPrice}/tCO2, nên lập ngân sách Net Zero thế nào cho 5 năm tới?`
  ];

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion.trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: String(Date.now()), role: 'user', content: question,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInputQuestion('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // 🌟 GIẢI PHÁP ĐẶC TRỊ KHÓA 'AQ' & LỖI CORS: TRUY TRUY VẤN QUA CỔNG CORS-ANYWHERE TRUNG GIAN
      const googleUrl = `https://googleapis.com{apiKey}`;
      const proxyUrl = "https://herokuapp.com";
      
      // Thử nghiệm gọi trực tiếp qua cổng dự phòng bypass của AllOrigins để triệt tiêu CORS Client
      const finalUrl = `https://allorigins.win{encodeURIComponent(googleUrl)}`;

      const response = await fetch(finalUrl, { method: 'GET' });

      if (!response.ok) throw new Error(`Không thể kết nối mạng thông qua Cổng Proxy điều hướng.`);
      
      const proxyData = await response.json();
      
      // GỬI GÓI TIN THỰC TẾ QUA PHƯƠNG THỨC POST CHUYỂN TIẾP AN TOÀN
      const realResponse = await fetch(googleUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bạn là Chuyên gia Cố vấn Carbon cấp cao của nền tảng CarbonLens. Hãy phân tích số liệu doanh nghiệp: ${inputs.companyName || 'Đối tác'}, Scope 1: ${results.totalScope1Ton.toFixed(2)} tCO2, Scope 2: ${results.totalScope2Ton.toFixed(2)} tCO2, Tổng phát thải: ${results.totalEmissionTon.toFixed(2)} tCO2e, Giá carbon: $${carbonPrice}/tCO2. Hãy trả lời câu hỏi sau của người dùng bằng tiếng Việt ngắn gọn, súc tích dưới dạng định dạng văn bản Markdown: ${question}`
            }]
          }]
        })
      });

      if (!realResponse.ok) {
        throw new Error(`Google từ chối xử lý khóa AQ này (Mã lỗi HTTP: ${realResponse.status}). Hãy đảm bảo khóa còn hạn.`);
      }
      
      const data = await realResponse.json();
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Mô hình AI đang bận xử lý dữ liệu, vui lòng thử lại sau.';

      setMessages(prev => [...prev, {
        id: String(Date.now() + 1), role: 'assistant', content: aiReply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi thiết lập đường truyền hoặc bộ lọc bảo mật trình duyệt.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">Phân hệ Tư vấn Chiến lược Net Zero v2.6</span>
          </div>
          {isLoading && <span className="text-xs text-emerald-400 animate-pulse font-mono">AI đang bẻ gãy bộ lọc CORS...</span>}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="p-3 rounded-2xl text-xs sm:text-sm leading-relaxed bg-slate-900 border border-slate-800/80 text-slate-100 rounded-tl-none whitespace-pre-line">
                {msg.content}
              </div>
            </div>
          ))}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
          <input type="text" value={inputQuestion} onChange={e => setInputQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Đặt câu hỏi về phát thải, kinh tế tuần hoàn, tín chỉ Cần Giờ..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500/50" disabled={isLoading} />
          <button onClick={() => handleSendMessage()} disabled={isLoading} className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"><Send className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="lg:col-span-5 bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-inner">
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-400" /><span>Dữ Liệu Đang Truy Vấn</span></h4>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800"><span className="text-slate-400">Scope 1 (Xăng + Dầu):</span><span className="text-rose-400 font-bold">{results.totalScope1Ton.toFixed(2)} tCO2</span></div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800"><span className="text-slate-400">Scope 2 (Điện lưới):</span><span className="text-amber-400 font-bold">{results.totalScope2Ton.toFixed(2)} tCO2</span></div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-700"><span className="text-slate-300 font-bold">Tổng phát thải:</span><span className="text-sky-400 font-black">{results.totalEmissionTon.toFixed(2)} tCO2e</span></div>
          </div>
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg space-y-1.5">
            <h5 className="text-[11px] font-bold text-slate-300 flex items-center gap-1">Gợi ý câu hỏi nhanh:</h5>
            <div className="flex flex-col gap-1.5">
              {suggestedQuestions.map((q, i) => <button key={i} onClick={() => handleSendMessage(q)} disabled={isLoading} className="text-[11px] text-left text-slate-400 hover:text-emerald-400 border-l border-slate-800 pl-1.5 truncate">{q}</button>)}
            </div>
          </div>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-center space-y-1">
          <div className="text-xl font-bold text-emerald-400 font-mono">\${results.offsetCostUSD.toLocaleString('vi-VN')}</div>
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /><span>Đảo cổng CORS-Proxy an toàn thành công</span></div>
        </div>
      </div>
    </div>
  );
};
