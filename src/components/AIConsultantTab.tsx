import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, User, Sparkles, RefreshCw, AlertCircle, 
  HelpCircle, Lightbulb, ChevronRight, CheckCircle2, Copy, Check
} from 'lucide-react';
import { EmissionInputs, EmissionResults } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIConsultantTabProps {
  inputs: EmissionInputs;
  results: EmissionResults;
  carbonPrice: number;
}

export const AIConsultantTab: React.FC<AIConsultantTabProps> = ({
  inputs,
  results,
  carbonPrice
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào! Tôi là **Trợ lý Cố vấn AI CarbonLens**, được huấn luyện về chuyên ngành Kinh tế tuần hoàn, Kiểm kê Khí nhà kính (GHG Protocol Scope 1 & 2), và Hệ sinh thái Blue Carbon Rừng ngập mặn Cần Giờ.

Tôi có thể giúp bạn:
- Phân tích chi tiết hồ sơ phát thải của **${inputs.companyName || 'doanh nghiệp của bạn'}** (hiện tại: **${results.totalEmissionTon.toFixed(2)} tấn CO2e**).
- Gợi ý các giải pháp kỹ thuật kinh tế tuần hoàn để cắt giảm phát thải Scope 1 & Scope 2.
- Tư vấn cơ chế định giá và chiến lược mua tín chỉ carbon rừng Cần Giờ để đạt chuẩn Net Zero.
- Giải thích các dữ liệu sinh khối, trầm tích lưu trữ Blue Carbon tại Khu dự trữ sinh quyển Cần Giờ.

Hãy nhập câu hỏi bên dưới hoặc chọn các câu hỏi gợi ý nhanh để bắt đầu!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    `Đánh giá mức phát thải ${results.totalEmissionTon.toFixed(1)} tCO2 của doanh nghiệp tôi và đề xuất 3 giải pháp giảm nhanh Scope 1 & 2?`,
    'Tại sao carbon rừng ngập mặn Cần Giờ (Blue Carbon) lại hấp thụ cao gấp 4-6 lần rừng trên cạn?',
    `Với mức giá tín chỉ $${carbonPrice}/tCO2, doanh nghiệp nên lập kế hoạch ngân sách Net Zero như thế nào cho 5 năm tới?`,
    'Quy trình tiêu hủy tín chỉ carbon (Retirement) diễn ra như thế nào để đảm bảo không bị tính trùng (Double counting)?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion.trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuestion('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          companyContext: {
            companyName: inputs.companyName,
            scale: inputs.scale,
            electricityKWh: inputs.electricityKWh,
            petrolLiters: inputs.petrolLiters,
            dieselLiters: inputs.dieselLiters,
            scope1Ton: results.totalScope1Ton.toFixed(2),
            scope2Ton: results.totalScope2Ton.toFixed(2),
            totalEmissionTon: results.totalEmissionTon.toFixed(2),
            carbonPrice: carbonPrice,
            offsetCostUSD: results.offsetCostUSD.toFixed(0)
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Lỗi máy chủ (${response.status})`);
      }

      const data = await response.json();
      const aiReply = data.reply || 'Xin lỗi, không có phản hồi từ mô hình AI.';

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuestion('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 🌟 NẠP BẢO MẬT API KEY TỪ BIẾN MÔI TRƯỜNG GITHUB CỦA BẠN
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // ĐƯỜNG DẪN ENDPOINT CHUẨN CỦA GOOGLE AGENT ĐỂ KHỚP VỚI MÃ AQ.Ab8...
      const API_URL = "https://googleapis.com";

      // Gọi trực tiếp đến Google AI Studio thay vì gọi qua cổng nội bộ /api/chat bị lỗi
      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey || '' // Ép tiêu đề bảo mật xác thực của Google Agent
        },
        body: JSON.stringify({
          prompt: {
            text: `Bạn là Chuyên gia Cố vấn Carbon cấp cao của CarbonLens. Hãy phân tích hồ sơ phát thải của doanh nghiệp ${inputs.companyName || 'đối tác'} với số liệu: Scope 1 (Xăng/Dầu) là ${results.totalScope1Ton.toFixed(2)} tCO2, Scope 2 (Điện lưới) là ${results.totalScope2Ton.toFixed(2)} tCO2, Tổng phát thải ${results.totalEmissionTon.toFixed(2)} tCO2e, chi phí bù đắp ước tính là $${results.offsetCostUSD.toFixed(0)} với giá tín chỉ carbon công khai là $${carbonPrice}/tCO2. Hãy trả lời câu hỏi sau của người dùng bằng ngôn ngữ Tiếng Việt chuẩn định dạng Markdown ngắn gọn, súc tích: ${question}`
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Mã lỗi từ máy chủ Google: ${response.status}`);
      }

      const data = await response.json();
      
      // Bóc tách cấu trúc dữ liệu trả về linh hoạt theo chuẩn phản hồi Tác nhân Google Agent
      const aiReply = data.interaction?.output_text || data.candidates?.[0]?.content?.parts?.[0]?.text || 'Mô hình Tác nhân AI đang bận xử lý chuỗi sinh khối, vui lòng gửi lại câu hỏi sau giây lát.';
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: aiReply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Không thể kết nối với máy chủ Google AI Studio. Vui lòng kiểm tra lại khóa.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trợ lý Khoa học AI (Gemini 3.8 Flash)</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Kinh tế tuần hoàn</span>
              <span aria-hidden="true">·</span>
              <span>Tín chỉ Carbon Rừng Cần Giờ</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Hỏi Đáp Trí Tuệ Nhân Tạo & Tham Vấn Chiến Lược Net Zero
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Đặt câu hỏi chuyên sâu về phương pháp tính toán kiểm kê, mô hình kinh tế tuần hoàn, dữ liệu sinh khối lưu trữ của rừng ngập mặn Cần Giờ và lộ trình giao dịch tín chỉ bù đắp.
            </p>
          </div>

          <div className="bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2 self-start md:self-auto font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Doanh nghiệp: <b className="text-white font-sans">{inputs.companyName || 'Đang phân tích'}</b> ({results.totalEmissionTon.toFixed(1)} tCO2)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Conversation Box (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
          {/* Top Bar */}
          <div className="px-5 py-3.5 bg-slate-900/80 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white leading-tight">Cố Vấn Khoa Học CarbonLens</h3>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span>● Trực tuyến</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">Gắn kết ngữ cảnh dữ liệu hiện hành</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([messages[0]]);
                setErrorMsg(null);
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs flex items-center gap-1"
              title="Làm mới cuộc trò chuyện"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>

                  <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="hover:text-emerald-400 transition-colors flex items-center gap-1 ml-2"
                        title="Sao chép câu trả lời"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl rounded-bl-none p-4 text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <span>AI đang đối chiếu dữ liệu phát thải & lập luận khoa học...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3.5 bg-slate-900/90 border-t border-slate-700/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Đặt câu hỏi về phát thải, kinh tế tuần hoàn, tín chỉ Cần Giờ..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuestion.trim()}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-md"
              >
                <span>Gửi</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Contextual Guide & Suggested Prompts (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Prompts */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
              <Lightbulb className="w-4 h-4" />
              <span>Gợi Ý Câu Hỏi Trọng Tâm</span>
            </h3>

            <div className="space-y-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition-all group flex items-start gap-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 mt-0.5 transition-colors" />
                  <span className="leading-snug">{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Enterprise Snapshot Card */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Dữ Liệu Đang Truy Vấn</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Đơn vị kiểm kê:</span>
                <span className="text-white font-semibold font-sans truncate max-w-[150px]">{inputs.companyName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Scope 1 (Xăng + Dầu):</span>
                <span className="text-amber-400">{results.totalScope1Ton.toFixed(2)} tCO2</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Scope 2 (Điện lưới):</span>
                <span className="text-blue-400">{results.totalScope2Ton.toFixed(2)} tCO2</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Tổng phát thải:</span>
                <span className="text-emerald-400 font-bold">{results.totalEmissionTon.toFixed(2)} tCO2e</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Chi phí bù đắp:</span>
                <span className="text-emerald-400 font-bold">${results.offsetCostUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
              Mô hình AI sẽ tự động phân tích dựa trên thông số phát thải thực tế bạn nhập tại Mục 1 (Tính toán phát thải) để đưa ra phản biện và giải pháp giảm thải sát với thực tế nhất.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
