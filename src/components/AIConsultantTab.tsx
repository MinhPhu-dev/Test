import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, ShieldCheck } from 'lucide-react';
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

// Đổi tên model nếu tài khoản của bạn không dùng được model này
const MODEL = 'gemini-2.5-flash';

const nowLabel = () =>
  new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

// Khóa bắt đầu bằng "AQ." là khóa Vertex AI express mode, dùng endpoint aiplatform.
// Khóa "AIza..." (Google AI Studio) dùng endpoint generativelanguage.
const buildUrl = (apiKey: string) =>
  apiKey.startsWith('AQ.')
    ? `https://aiplatform.googleapis.com/v1/publishers/google/models/${MODEL}:generateContent?key=${apiKey}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

// Hiển thị **chữ đậm** trong câu trả lời của AI
const renderText = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );

export const AIConsultantTab: React.FC<AIConsultantTabProps> = ({ inputs, results, carbonPrice }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào! Tôi là **Trợ lý Cố vấn AI CarbonLens**. Tôi đã đồng bộ hồ sơ phát thải của **${inputs.companyName || 'doanh nghiệp'}** (hiện trạng: **${results.totalEmissionTon.toFixed(2)} tấn CO2e**).\n\nHãy đặt câu hỏi bên dưới để tôi tư vấn chiến lược cắt giảm phát thải Scope 1 & 2 và lộ trình mua tín chỉ Blue Carbon rừng Cần Giờ.`,
      timestamp: nowLabel(),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    `Đánh giá mức phát thải ${results.totalEmissionTon.toFixed(1)} tCO2 và đề xuất giải pháp giảm nhanh Scope 1 & 2?`,
    'Tại sao Blue Carbon rừng ngập mặn Cần Giờ hấp thụ carbon tốt hơn rừng trên cạn?',
    `Với giá tín chỉ $${carbonPrice}/tCO2, nên lập ngân sách Net Zero thế nào cho 5 năm tới?`,
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, errorMsg]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend ?? inputQuestion).trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: nowLabel(),
    };

    // Lịch sử gửi cho AI: bỏ lời chào, giữ các lượt hỏi - đáp trước đó để AI hiểu ngữ cảnh
    const history = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    setMessages(prev => [...prev, userMessage]);
    setInputQuestion('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) {
        throw new Error('Chưa có VITE_GEMINI_API_KEY trong file .env (sau khi sửa .env phải chạy lại npm run dev).');
      }

      const systemPrompt =
        `Bạn là chuyên gia tư vấn carbon của nền tảng CarbonLens. ` +
        `Dữ liệu doanh nghiệp: ${inputs.companyName || 'Đối tác'}; ` +
        `Scope 1: ${results.totalScope1Ton.toFixed(2)} tCO2; ` +
        `Scope 2: ${results.totalScope2Ton.toFixed(2)} tCO2; ` +
        `tổng phát thải: ${results.totalEmissionTon.toFixed(2)} tCO2e; ` +
        `giá carbon: $${carbonPrice}/tCO2. ` +
        `Trả lời bằng tiếng Việt, ngắn gọn, dùng **chữ đậm** cho ý chính. Không bịa số liệu ngoài dữ liệu đã cho.`;

      const res = await fetch(buildUrl(apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [...history, { role: 'user', parts: [{ text: question }] }],
        }),
      });

      if (!res.ok) {
        const detail = await res.text(); // Google trả lý do cụ thể: key sai, model không có, hết quota...
        throw new Error(`API lỗi ${res.status}: ${detail.slice(0, 300)}`);
      }

      const data = await res.json();
      const aiReply: string =
        data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ||
        'Mô hình chưa trả về nội dung, vui lòng thử lại.';

      setMessages(prev => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: aiReply, timestamp: nowLabel() },
      ]);
    } catch (err: any) {
      console.error(err);
      const isNetwork = err instanceof TypeError; // "Failed to fetch" thuộc loại này
      setErrorMsg(
        isNetwork
          ? 'Không gửi được request. Kiểm tra mạng, VPN hoặc tiện ích chặn quảng cáo, rồi mở F12 > Network để xem chi tiết.'
          : err.message || 'Không kết nối được tới máy chủ AI.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      {/* Khung chat */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">Tư vấn chiến lược Net Zero</span>
          </div>
          {isLoading && <span className="text-xs text-emerald-400 animate-pulse">AI đang trả lời...</span>}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div>
                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-100 border ${
                    msg.role === 'user'
                      ? 'bg-emerald-900/40 border-emerald-700/40 rounded-tr-none'
                      : 'bg-slate-900 border-slate-800/80 rounded-tl-none'
                  }`}
                >
                  {renderText(msg.content)}
                </div>
                <div className={`mt-1 text-[10px] text-slate-500 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium break-words">
              {errorMsg}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={e => setInputQuestion(e.target.value)}
            onKeyDown={e => {
              // Không gửi khi đang gõ dấu tiếng Việt (Telex/VNI)
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSendMessage();
            }}
            placeholder="Đặt câu hỏi về phát thải, kinh tế tuần hoàn, tín chỉ Cần Giờ..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500/50 disabled:opacity-60"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputQuestion.trim()}
            aria-label="Gửi"
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cột dữ liệu */}
      <div className="lg:col-span-5 bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-inner overflow-y-auto">
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Dữ liệu đang gửi cho AI</span>
            </h4>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400">Scope 1 (xăng + dầu):</span>
              <span className="text-rose-400 font-bold">{results.totalScope1Ton.toFixed(2)} tCO2</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400">Scope 2 (điện lưới):</span>
              <span className="text-amber-400 font-bold">{results.totalScope2Ton.toFixed(2)} tCO2</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-700">
              <span className="text-slate-300 font-bold">Tổng phát thải:</span>
              <span className="text-sky-400 font-black">{results.totalEmissionTon.toFixed(2)} tCO2e</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg space-y-1.5">
            <h5 className="text-[11px] font-bold text-slate-300">Gợi ý câu hỏi nhanh:</h5>
            <div className="flex flex-col gap-1.5">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  title={q}
                  className="text-[11px] text-left text-slate-400 hover:text-emerald-400 border-l border-slate-800 pl-1.5 truncate disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-center space-y-1">
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {'$'}
            {results.offsetCostUSD.toLocaleString('vi-VN')}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Chi phí bù đắp carbon ước tính</span>
          </div>
        </div>
      </div>
    </div>
  );
};
