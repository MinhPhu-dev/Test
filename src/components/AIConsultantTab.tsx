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

const nowLabel = () =>
  new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const fmt = (n: number, digits = 1) =>
  n.toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const fmtInt = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 0 });

// Hiển thị **chữ đậm** trong câu trả lời
const renderText = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );

const includesAny = (text: string, keywords: string[]) => keywords.some(k => text.includes(k));

export const AIConsultantTab: React.FC<AIConsultantTabProps> = ({ inputs, results, carbonPrice }) => {
  const company = inputs.companyName || 'doanh nghiệp';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào! Tôi là **Trợ lý Cố vấn CarbonLens**. Tôi đang dùng hồ sơ phát thải của **${company}** (hiện trạng: **${fmt(results.totalEmissionTon, 2)} tấn CO2e**).\n\nHãy chọn một câu hỏi gợi ý hoặc tự đặt câu hỏi về cắt giảm Scope 1 & 2, tín chỉ Blue Carbon Cần Giờ và ngân sách Net Zero.`,
      timestamp: nowLabel(),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    `Đánh giá mức phát thải ${fmt(results.totalEmissionTon)} tCO2 và đề xuất giải pháp giảm nhanh Scope 1 & 2?`,
    'Tại sao Blue Carbon rừng ngập mặn Cần Giờ hấp thụ carbon tốt hơn rừng trên cạn?',
    `Với giá tín chỉ $${carbonPrice}/tCO2, nên lập ngân sách Net Zero thế nào cho 5 năm tới?`,
    'Cơ chế retire tín chỉ chống tính trùng hoạt động ra sao?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Trả lời theo quy tắc, dùng số liệu kiểm kê hiện tại. Không gọi dịch vụ bên ngoài.
  const buildReply = (question: string): string => {
    const q = question.toLowerCase();
    const total = results.totalEmissionTon;
    const s1 = results.totalScope1Ton;
    const s2 = results.totalScope2Ton;
    const s1Pct = total > 0 ? (s1 / total) * 100 : 0;
    const s2Pct = total > 0 ? (s2 / total) * 100 : 0;

    if (includesAny(q, ['retire', 'retirement', 'tính trùng', 'double counting', 'chống'])) {
      return (
        `**Cơ chế retire chống tính trùng:**\n\n` +
        `- Mỗi tín chỉ có mã định danh duy nhất trên sổ cái.\n` +
        `- Khi doanh nghiệp bù đắp, tín chỉ được retire: khóa vĩnh viễn và không thể bán lại.\n` +
        `- Chứng nhận ghi rõ đơn vị, khối lượng, thời điểm và mã lô để kiểm toán đối chiếu.`
      );
    }

    if (includesAny(q, ['giải pháp', 'giảm', 'đánh giá', 'mức phát thải'])) {
      if (total <= 0) {
        return 'Hiện chưa có dữ liệu phát thải. Hãy nhập mức tiêu thụ điện, xăng, dầu ở tab Kiểm kê để tôi đánh giá.';
      }
      const biggest = s2 >= s1 ? 'Scope 2 (điện lưới)' : 'Scope 1 (xăng, dầu)';
      return (
        `**Đánh giá phát thải của ${company}:**\n\n` +
        `Tổng phát thải **${fmt(total, 2)} tCO2e**: Scope 1 chiếm ${fmt(s1Pct)}%, Scope 2 chiếm ${fmt(s2Pct)}%. ` +
        `Nguồn lớn nhất là **${biggest}**. Chi phí bù đắp ước tính **$${fmtInt(results.offsetCostUSD)}**.\n\n` +
        `Ba hướng giảm, ưu tiên theo nguồn lớn nhất:\n\n` +
        `1. **Scope 2:** lắp điện mặt trời mái nhà, có thể giảm khoảng 30-40% điện mua từ lưới (mức tham khảo).\n` +
        `2. **Scope 1:** tối ưu tuyến vận chuyển và điện hóa dần đội xe nội bộ.\n` +
        `3. **Bù đắp:** mua tín chỉ Blue Carbon Cần Giờ cho phần còn lại chưa giảm được.`
      );
    }

    if (includesAny(q, ['ngân sách', 'esg', 'giá tín chỉ', '5 năm', 'net zero'])) {
      if (total <= 0) {
        return 'Hiện chưa có dữ liệu phát thải để lập ngân sách. Hãy nhập dữ liệu ở tab Kiểm kê trước.';
      }
      // Giả định minh họa: giảm 8% mỗi năm nhờ đầu tư tiết kiệm năng lượng, giá carbon giữ nguyên
      const rate = 0.08;
      const rows: string[] = [];
      let sum = 0;
      for (let y = 1; y <= 5; y++) {
        const e = total * Math.pow(1 - rate, y - 1);
        const cost = e * carbonPrice;
        sum += cost;
        rows.push(`- Năm ${y}: ${fmt(e)} tCO2e, bù đắp ~$${fmtInt(cost)}`);
      }
      return (
        `**Ngân sách bù đắp 5 năm (giá $${carbonPrice}/tCO2, kịch bản minh họa):**\n\n` +
        `Giả định phát thải giảm ${rate * 100}% mỗi năm và giá tín chỉ không đổi:\n\n` +
        `${rows.join('\n')}\n\n` +
        `Tổng khoảng **$${fmtInt(sum)}**, so với **$${fmtInt(results.offsetCostUSD * 5)}** nếu không giảm gì. ` +
        `Đây chỉ là mô phỏng, không phải dự báo giá thị trường.`
      );
    }

    if (includesAny(q, ['blue carbon', 'hấp thụ', 'rừng', 'cần giờ', 'gấp'])) {
      return (
        `**Vì sao rừng ngập mặn Cần Giờ lưu giữ carbon tốt:**\n\n` +
        `- **Trầm tích thiếu oxy:** carbon trong bùn ngập triều phân hủy rất chậm, nên phần lớn carbon nằm dưới lớp đất chứ không phải trên cây.\n` +
        `- **Hệ rễ dày:** rễ Đước, Mấm giữ lại phù sa hữu cơ từ sông Soài Rạp và Lòng Tàu.\n` +
        `- **Khí hậu nhiệt đới:** cây tích lũy sinh khối quanh năm.\n\n` +
        `Muốn con số cụ thể (ha, tCO2/ha/năm) thì xem tab Rừng Cần Giờ, vì số liệu do BQL rừng cập nhật.`
      );
    }

    return (
      `Bạn hỏi về: *“${question}”*.\n\n` +
      `Với dữ liệu của ${company} (**${fmt(total, 2)} tCO2e**), bạn có thể thử các câu hỏi gợi ý bên phải ` +
      `về giảm phát thải, ngân sách Net Zero, Blue Carbon Cần Giờ hoặc cơ chế retire tín chỉ.`
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend ?? inputQuestion).trim();
    if (!question || isLoading) return;

    setMessages(prev => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: question, timestamp: nowLabel() },
    ]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // chờ ngắn cho tự nhiên
      const reply = buildReply(question);
      setMessages(prev => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: reply, timestamp: nowLabel() },
      ]);
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
          <span className="text-[11px] text-slate-500">
            {isLoading ? 'Đang soạn câu trả lời...' : 'Trả lời theo quy tắc, không dùng AI bên ngoài'}
          </span>
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
            placeholder="Đặt câu hỏi về phát thải, tín chỉ Cần Giờ, ngân sách Net Zero..."
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
              <span>Dữ liệu đang dùng để trả lời</span>
            </h4>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400">Scope 1 (xăng + dầu):</span>
              <span className="text-rose-400 font-bold">{fmt(results.totalScope1Ton, 2)} tCO2</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400">Scope 2 (điện lưới):</span>
              <span className="text-amber-400 font-bold">{fmt(results.totalScope2Ton, 2)} tCO2</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-700">
              <span className="text-slate-300 font-bold">Tổng phát thải:</span>
              <span className="text-sky-400 font-black">{fmt(results.totalEmissionTon, 2)} tCO2e</span>
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
            {fmtInt(results.offsetCostUSD)}
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
