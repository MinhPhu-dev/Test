# Hướng dẫn Cài đặt & Chạy CarbonLens trên Máy tính Cá nhân

Dự án: **CarbonLens - Nền tảng phân tích phát thải doanh nghiệp và định giá tín chỉ carbon rừng ngập mặn Cần Giờ**
Môi trường khuyến nghị: Python 3.9 - 3.12

---

## 1. Chuẩn bị môi trường & Cài đặt thư viện

Mở terminal (Command Prompt trên Windows, hoặc Terminal trên macOS / Linux) và chạy:

```bash
# Bước 1: Tạo môi trường ảo (Khuyến nghị)
python -m venv venv

# Kích hoạt môi trường ảo:
# Trên Windows:
venv\Scripts\activate
# Trên macOS / Linux:
source venv/bin/activate

# Bước 2: Cài đặt các thư viện cần thiết
pip install streamlit pandas numpy plotly
# Hoặc cài từ requirements.txt nếu có:
pip install -r requirements.txt
```

---

## 2. Khởi chạy ứng dụng Web

Di chuyển vào thư mục dự án và chạy:

```bash
streamlit run app.py
```

Sau khi chạy lệnh trên, trình duyệt web của bạn sẽ tự động mở địa chỉ:
👉 **`http://localhost:8501`**

---

## 🎨 3. LÀM SAO ĐỂ CÓ GIAO DIỆN XANH NGỌC - DARK MODE CAO CẤP (KHÔNG BỊ NỀN TRẮNG CHỮ ĐEN)?

Mặc định khi bạn mới cài Streamlit, phần mềm sẽ dùng theme trắng cơ bản (Light theme) trông đơn điệu. Để có giao diện **Dark Luxury Emerald (Nền tối huyền bí, viền kính neon ngọc lục bảo, biểu đồ phát sáng)** y hệt như bản Demo:

### 👉 Cách 1: Sử dụng file cấu hình `.streamlit/config.toml` (Khuyến nghị)
Trong cùng thư mục chứa file `app.py`, hãy tạo một thư mục con tên là `.streamlit` và bên trong tạo file `config.toml` với nội dung sau (trong bộ mã nguồn này đã có sẵn):

```toml
[theme]
base = "dark"
primaryColor = "#10b981"
backgroundColor = "#020617"
secondaryBackgroundColor = "#0f172a"
textColor = "#f8fafc"
font = "sans serif"

[server]
headless = true
enableCORS = false
enableXsrfProtection = false
```

### 👉 Cách 2: Bật thủ công ngay trên giao diện Streamlit (1 giây)
1. Khi trang web Streamlit mở ra trên trình duyệt (`http://localhost:8501`), nhìn lên **góc trên cùng bên phải**.
2. Bấm vào biểu tượng **3 dấu chấm (⋮)** -> chọn **Settings**.
3. Tại mục **Theme**, đổi từ *"Light"* sang **"Dark"**.
4. Toàn bộ nền sẽ lập tức chuyển sang màu tối sâu thẳm, các thẻ chỉ số phát sáng xanh ngọc và biểu đồ tương phản cao cực kỳ hiện đại!

### 👉 Cách 3: Chạy trực tiếp phiên bản Web App React/Tailwind chuẩn mực
Ứng dụng bạn đang xem trên trình duyệt AI Studio là một bản Web App React + Tailwind CSS + Lucide Icons + Gemini AI Server. Nếu muốn chạy chính xác bản Web App này trên máy tính cá nhân:
```bash
# Cài đặt thư viện Node.js:
npm install

# Khởi chạy server phát triển:
npm run dev
```
👉 Mở trình duyệt tại: **`http://localhost:3000`** (Giao diện React mượt mà 60fps, tương tác tức thời).

---

## 4. Cấu trúc 4 Phân hệ Nghiên cứu trong Ứng dụng:

1. **Phần 1: Công cụ Tính toán Phát thải & Mô phỏng Kịch bản Giảm thải (What-if Analysis & DSS)**
   - Nhập liệu lượng điện tiêu thụ (kWh), lượng xăng (lít), lượng dầu diesel (lít).
   - Tự động tính toán phát thải Scope 1 (Trực tiếp từ nhiên liệu hóa thạch) và Scope 2 (Gián tiếp qua lưới điện quốc gia EVN theo chuẩn Bộ TN&MT).
   - Bộ máy định giá động (Dynamic Valuation Engine): Quy đổi phát thải ra chi phí tài chính bù đắp (USD và VNĐ) theo giá thị trường tín chỉ carbon ($/tCO2e).
   - Biểu đồ phân tích độ nhạy chi phí bù đắp theo các kịch bản giá carbon quốc tế.
   - **Mô phỏng Kịch bản Giảm phát thải (Scenario Simulation & What-if Analysis):**
     + 4 cần gạt can thiệp: Tỷ lệ Điện mặt trời mái nhà (Solar Rooftop %), Tối ưu hóa vận tải Logistics (%), Điện hóa đội xe (EV Fleet %), và Tiết kiệm năng lượng IoT (%).
     + 4 kịch bản chiến lược mẫu: Hiện trạng (BAU), Chuyển dịch vừa (35%), Tham vọng ESG (60%), và Tiên phong Net-Zero (85%).
     + Phân tích **Lợi ích kinh tế kép (Double Dividend):** Tính toán chính xác % giảm phát thải, lượng tCO2 cắt giảm, số tiền tiết kiệm mua tín chỉ carbon và tiết kiệm chi phí điện/xăng dầu vận hành hàng năm.
   - **Tự động hóa Xuất Báo Cáo ESG & Kiểm Kê GHG chuẩn Quốc tế (ISO 14064 & EU CBAM):**
     + Tự động lập bạch thư ESG và báo cáo kiểm kê theo khung **ISO 14064-1:2018 & GHG Protocol**.
     + Hỗ trợ **In / Xuất file PDF trực tiếp** và **Tải file dữ liệu báo cáo (CSV / Excel)**.

2. **Phần 2: Giám sát Bể chứa Carbon Rừng ngập mặn Cần Giờ (Eco-Dashboard)**
   - Trực quan hóa dữ liệu sinh khối Khu dự trữ sinh quyển thế giới Rừng ngập mặn Cần Giờ (35,120 ha rừng phòng hộ, công suất hấp thụ ~650,000 tCO2/năm).
   - Phân rã cấu trúc bể carbon (Carbon Pools): Sinh khối trên mặt đất (AGB), dưới mặt đất (BGB) và đặc biệt là bể trầm tích Carbon Xanh (Soil Organic Blue Carbon > 60%).
   - Biểu đồ dự báo hấp thụ carbon giai đoạn 2026 - 2035 theo 3 kịch bản: Chuẩn (Baseline), Tăng cường phục hồi (Enhanced Restoration), và Rủi ro BĐKH.
   - **Sơ đồ Chuỗi cung ứng Ngược & Bản đồ Tuần hoàn (Reverse Logistics & Traceability Map):**
     + Vòng lặp Dòng tiền & Tín chỉ: Doanh nghiệp ➔ Quỹ Ủy thác Smart Escrow ➔ BQL & Hộ dân giữ rừng (PES) ➔ Blue Carbon trầm tích ➔ Sổ cái tiêu hủy vĩnh viễn (Retirement).
     + Chuỗi cung ứng ngược sinh khối: Thu gom cành đước tỉa thưa & rác bãi bồi ➔ Nhiệt phân xanh Biochar ➔ Hoàn nguyên đất rừng ➔ Bao bì sinh học tuần hoàn.

3. **Phần 3: Sàn Giao dịch Mô phỏng & Chứng nhận Bù đắp (Simulated Trading Hub)**
   - Chọn các gói mục tiêu trung hòa carbon: 100% Net Zero, 75% ESG Tiên phong, 50% Chuyển dịch Xanh hoặc tùy chỉnh.
   - Xuất hóa đơn tài chính mô phỏng (bao gồm 5% phí bảo trợ quản lý và bảo vệ rừng ngập mặn).
   - Cấp Bằng Chứng nhận Bù đắp Carbon Kỹ thuật số (Digital Certificate) với mã băm duy nhất và tọa độ GPS rừng Cần Giờ.
   - **Dự báo Biến động Giá bằng Trí tuệ Nhân tạo (AI Price Forecasting & Hedging):**
     + Mô hình định lượng chuỗi thời gian AI dự báo giá tín chỉ Blue Carbon (+3 tháng, +6 tháng, +12 tháng) kèm khoảng tin cậy 95%.
     + Đánh giá tác động từ rào cản EU CBAM và Sàn Giao dịch Carbon Quốc gia Việt Nam.
     + Đưa ra **Khuyến nghị Chiến lược Mua (Strategic Purchasing Recommendation)**: Mua ngay để tiết kiệm 25% - 40% chi phí ngân sách so với tương lai.

4. **Phần 4: Cố Vấn Khoa Học AI & Hỏi Đáp Chiến Lược Net Zero (AI Consultant)**
   - Hỏi đáp trực tiếp với trợ lý trí tuệ nhân tạo chuyên sâu về Kinh tế tuần hoàn, Kiểm kê GHG Scope 1 - Scope 2 và Rừng ngập mặn Cần Giờ.
   - AI tự động gắn kết ngữ cảnh dữ liệu phát thải thực tế của doanh nghiệp (tên đơn vị, lượng điện, xăng, dầu, tổng tấn phát thải) để đưa ra phân tích sắc bén và khuyến nghị sát thực tế.
   - Hỗ trợ các câu hỏi gợi ý nhanh về giải pháp kỹ thuật, lý do Blue Carbon hấp thụ vượt trội, và kế hoạch phân bổ ngân sách ESG.

