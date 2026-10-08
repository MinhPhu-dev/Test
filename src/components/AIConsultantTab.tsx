import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, User, Sparkles, RefreshCw, AlertCircle, 
  Lightbulb, ChevronRight, CheckCircle2, Copy, Check
} from 'lucide-react';
import { EmissionInputs, EmissionResults } from '../types';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }
interface AIConsultantTabProps { inputs: EmissionInputs; results: EmissionResults; carbonPrice: number; }

export const AIConsultantTab: React.FC<AIConsultantTabProps> = ({ inputs, results, carbonPrice }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome', role: 'assistant',
      content: `Xin chào! Tôi là **Trợ lý Cố vấn AI CarbonLens**, được huấn luyện về chuyên ngành Kinh tế tuần hoàn, Kiểm kê Khí nhà kính (GHG Protocol Scope 1 & 2), và Hệ sinh thái Blue Carbon Rừng ngập mặn Cần Giờ.\n\nTôi có thể giúp bạn:\n- Phân tích chi tiết hồ sơ phát thải của **${inputs.companyName || 'doanh nghiệp của bạn'}** (hiện tại: **${results.totalEmissionTon.toFixed(2)} tấn CO2e**).\n- Gợi ý các giải pháp kỹ thuật kinh tế tuần hoàn để cắt giảm phát thải Scope 1 & Scope 2.\n- Tư vấn cơ chế định giá và chiến lược mua tín chỉ carbon rừng Cần Giờ để đạt chuẩn Net Zero.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    `Đánh giá mức phát thải ${results.totalEmissionTon.toFixed(1)} tCO2 của doanh nghiệp tôi và đề xuất giải pháp giảm nhanh Scope 1 & 2?`,
    'Tại sao carbon rừng ngập mặn Cần Giờ (Blue Carbon) lại hấp thụ cao gấp 4-6 lần rừng trên cạn?',
    `Với mức giá tín chỉ $${carbonPrice}/tCO2, doanh nghiệp nên lập kế hoạch ngân sách Net Zero như thế nào cho 5 năm tới?`
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
      const API_URL = "https://googleapis.com";

      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey || '' },
        body: JSON.stringify({
          prompt: {
            text: `Bạn là Chuyên gia Cố vấn Carbon của CarbonLens. Hãy phân tích số liệu: Doanh nghiệp ${inputs.companyName || 'đối tác'}, Scope 1: ${results.totalScope1Ton.toFixed(2)} tCO2, Scope 2: ${results.totalScope2Ton.toFixed(2)} tCO2, Tổng phát thải ${results.totalEmissionTon.toFixed(2)} tCO2e, giá tín chỉ carbon là $${carbonPrice}/tCO2. Hãy trả lời câu hỏi sau bằng tiếng Việt dưới dạng Markdown: ${question}`
          }
        })
      });

      if (!response.ok) throw new Error(`Mã lỗi từ máy chủ Google: ${response.status}`);
      const data = await response.json();
      const aiReply = data.interaction?.output_text || data.candidates?.[0]?.content?.parts?.[0]?.text || 'Mô hình AI đang bận xử lý, vui lòng thử lại sau giây lát.';

      setMessages(prev => [...prev, {
        id: String(Date.now() + 1), role: 'assistant', content: aiReply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể kết nối với máy chủ Google AI Studio. Vui lòng kiểm tra lại khóa.');
    } finally { setIsLoading(false); }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Sparkles className="w-3.5 h-3.5" /><span>Trợ lý Khoa học AI (Gemini Agent)</span></span>
              <span>·</span><span>Kinh tế tuần hoàn</span><span>·</span><span>Tín chỉ Carbon Rừng Cần Giờ</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Hỏi Đáp Trí Tuệ Nhân Tạo & Tham Vấn Chiến Lược Net Zero</h1>
          </div>
          <div className="bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-700/60 text-xs text-slate-300 font-mono shrink-0">
            <span>Doanh nghiệp: <b className="text-white font-sans">{inputs.companyName || 'Đang phân tích'}</b> ({results.totalEmissionTon.toFixed(1)} tCO2)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col h-[580px] bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-slate-900/80 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Cố Vấn Khoa Học CarbonLens (Đã gắn kết ngữ cảnh)</span>
            </div>
            <button onClick={() => { setMessages([messages[0]]); setErrorMsg(null); }} className="p-1.5 text-slate-400 hover:text-white rounded text-xs flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" />Làm mới</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0"><Bot className="w-4 h-4" /></div>}
                <div className={`relative max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-900/90 text-slate-200 border border-slate-700/60 rounded-bl-none'}`}>
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <button onClick={() => copyMessage(msg.id, msg.content)} className="hover:text-emerald-400 transition-colors flex items-center gap-1 ml-2">
                        {copiedId === msg.id ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Đã chép</span></> : <><Copy className="w-3 h-3" /><span>Sao chép</span></>}
                      </button>
                    )}
                  </div>
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 shrink-0"><User className="w-4 h-4" /></div>}
              </div>
            ))}
            {isLoading && <div className="flex gap-3 justify-start items-center"><div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0"><Bot className="w-4 h-4 animate-bounce" /></div><div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl rounded-bl-none p-4 text-xs text-slate-400 flex items-center gap-2"><span>AI đang đối chiếu dữ liệu phát thải & lập luận khoa học...</span></div></div>}
            {errorMsg && <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-medium">⚠️ Lỗi: {errorMsg}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3.5 bg-slate-900/90 border-t border-slate-700/60">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
              <input type="text" value={inputQuestion} onChange={(e) => setInputQuestion(e.target.value)} placeholder="Đặt câu hỏi về phát thải, kinh tế tuần hoàn, tín chỉ Cần Giờ..." className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500" disabled={isLoading} />
              <button type="submit" disabled={isLoading || !inputQuestion.trim()} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-md"><span>Gửi</span><Send className="w-3.5 h-3.5" /></button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 text-emerald-400"><Lightbulb className="w-4 h-4" /><span>Gợi Ý Câu Hỏi Trọng Tâm</span></h3>
            <div className="space-y-2">
              {suggestedQuestions.map((q, idx) => (
                <button key={idx} onClick={() => handleSendMessage(q)} disabled={isLoading} className="w-full text-left p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white flex items-start gap-2 group"><ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 mt-0.5" /><span className="leading-snug">{q}</span></button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Dữ Liệu Đang Truy Vấn</span></h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400 font-sans">Đơn vị:</span><span className="text-white font-semibold font-sans truncate max-w-[150px]">{inputs.companyName}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400 font-sans">Scope 1 (Xăng/Dầu):</span><span className="text-amber-400">{results.totalScope1Ton.toFixed(2)} tCO2</span></div>
              <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400 font-sans">Scope 2 (Điện lưới):</span><span className="text-blue-400">{results.totalScope2Ton.toFixed(2)} tCO2</span></div>
              <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400 font-sans">Tổng phát thải:</span><span className="text-emerald-400 font-bold">{results.totalEmissionTon.toFixed(2)} tCO2e</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-400 font-sans">Chi phí bù đắp:</span><span className="text-emerald-400 font-bold">\${results.offsetCostUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
