import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instruction grounded with domain knowledge of Can Gio Blue Carbon & Circular Economy
const SYSTEM_INSTRUCTION = `Bạn là Chuyên gia Cố vấn AI cao cấp thuộc Nền tảng Nghiên cứu CarbonLens (Chuyên ngành: Kinh tế tuần hoàn, Kiểm kê Khí nhà kính Scope 1 & 2 theo GHG Protocol, và Hệ sinh thái Blue Carbon Khu Dự trữ Sinh quyển Rừng ngập mặn Cần Giờ, TP.HCM).

Dữ liệu khoa học nền tảng bạn nắm vững:
1. Địa bàn Cần Giờ:
- Khu Dự trữ Sinh quyển Thế giới được UNESCO công nhận năm 2000, tổng diện tích tự nhiên ~75.740 ha, diện tích rừng phòng hộ ~35.120 ha.
- Hệ số hấp thụ carbon bình quân: ~18,5 tấn CO2e/ha/năm (gấp 4-6 lần rừng trên cạn nhờ trầm tích ngập triều).
- Khả năng hấp thụ sinh thái toàn khu rừng: ~650.000 tấn CO2e/năm.
- Trữ lượng carbon lưu giữ tích lũy: ~17,85 triệu tấn CO2e.
- Cấu trúc 4 bể carbon: Trầm tích hữu cơ xanh ngập mặn (Soil Organic Carbon) chiếm 62,5%, Sinh khối trên mặt đất (AGB - Đước đôi, Mấm, Bần) chiếm 23,0%, Sinh khối rễ ngập triều (BGB) chiếm 11,5%, Tầng rơi rụng & gỗ mục chiếm 3,0%.
- Cơ chế Blue Carbon: Trầm tích yếm khí ngập triều ngăn chặn quá trình oxy hóa phân hủy, giúp cố định carbon ổn định hàng trăm năm nếu rừng không bị phá hủy.

2. Phương pháp tính toán phát thải & Kinh tế tuần hoàn:
- Scope 1: Phát thải trực tiếp từ nhiên liệu đốt hóa thạch (Xăng: 2,31 kg CO2/L; Dầu Diesel: 2,68 kg CO2/L theo IPCC 2006).
- Scope 2: Phát thải gián tiếp qua lưới điện quốc gia EVN (Hệ số phát thải lưới điện VN do Cục Biến đổi khí hậu - Bộ TN&MT công bố: 0,7221 kg CO2/kWh).
- Định giá động: Giá tham chiếu thị trường tín chỉ carbon tự nguyện (VCM) dao động từ 10 - 35 USD/tấn CO2e, chuẩn quốc tế EU ETS/CORSIA có thể lên 50 - 75 USD/tấn.

Nhiệm vụ của bạn:
- Giải đáp chính xác, khoa học, chuyên nghiệp, ngôn từ trang trọng, tích cực, dễ hiểu bằng tiếng Việt cho các nhà nghiên cứu, lãnh đạo doanh nghiệp, và chuyên viên ESG.
- Hỗ trợ phân tích dữ liệu phát thải, gợi ý giải pháp kinh tế tuần hoàn (tiết kiệm điện năng, chuyển đổi xe điện, năng lượng tái tạo, giảm thiểu lãng phí).
- Hướng dẫn lộ trình trung hòa carbon (Net Zero), cơ chế tiêu hủy tín chỉ (Retirement) và bảo tồn sinh thái rừng Cần Giờ.
- Trả lời có cấu trúc mạch lạc, dùng gạch đầu dòng rõ ràng, số liệu kiểm chứng khi phù hợp.`;

// API endpoint for AI Q&A
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, companyContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Nội dung câu hỏi không hợp lệ.' });
    }

    let contextualPrompt = '';
    if (companyContext) {
      contextualPrompt = `[Ngữ cảnh doanh nghiệp hiện tại trong ứng dụng]:
- Tên đơn vị: ${companyContext.companyName || 'Doanh nghiệp'}
- Quy mô: ${companyContext.scale || 'Vừa'}
- Tiêu thụ điện: ${companyContext.electricityKWh?.toLocaleString() || 0} kWh (Scope 2: ${companyContext.scope2Ton || 0} tCO2)
- Tiêu thụ Xăng: ${companyContext.petrolLiters?.toLocaleString() || 0} lít | Dầu: ${companyContext.dieselLiters?.toLocaleString() || 0} lít (Scope 1: ${companyContext.scope1Ton || 0} tCO2)
- Tổng phát thải hiện tại: ${companyContext.totalEmissionTon || 0} tấn CO2e
- Giá tín chỉ đang chọn: $${companyContext.carbonPrice || 15}/tCO2 (Chi phí bù đắp: $${companyContext.offsetCostUSD || 0})\n\n`;
    }

    // Format chat history for generateContent
    const userPrompt = messages[messages.length - 1].content;
    const historyText = messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'Người dùng' : 'Chuyên gia CarbonLens'}: ${m.content}`).join('\n');

    const fullContent = `${contextualPrompt}${historyText ? `Lịch sử hội thoại:\n${historyText}\n\n` : ''}Câu hỏi hiện tại của người dùng: ${userPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullContent,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Lỗi khi gọi Gemini API:', error);
    return res.status(500).json({
      error: 'Không thể kết nối với dịch vụ AI vào lúc này. Vui lòng thử lại sau giây lát.',
      details: error?.message || 'Unknown error',
    });
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarbonLens Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
