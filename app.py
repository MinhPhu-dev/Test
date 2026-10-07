# -*- coding: utf-8 -*-
"""
CarbonLens - Nền tảng Kiểm kê Phát thải Doanh nghiệp & Thị trường Tín chỉ Blue Carbon Cần Giờ
Phiên bản Giao diện Cao cấp (Dark Luxury Emerald & Glassmorphism UI)
Phục vụ nghiên cứu khoa học Kinh tế tuần hoàn & Thị trường Tín chỉ Carbon.
"""

import csv
import hashlib
import io
from datetime import datetime
from html import escape

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# ==============================================================================
# 1. CẤU HÌNH TRANG STREAMLIT
# ==============================================================================
st.set_page_config(
    page_title="CarbonLens - Kiểm kê Phát thải & Tín chỉ Blue Carbon Cần Giờ",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ==============================================================================
# 2. HẰNG SỐ KHOA HỌC & DỮ LIỆU CHUẨN
# ==============================================================================
EMERALD = "#10b981"
DARK_EMERALD = "#059669"
SKY_BLUE = "#38bdf8"
AMBER_GOLD = "#fbbf24"
ROSE_RED = "#f43f5e"
PURPLE = "#c084fc"
SLATE_BORDER = "#1e293b"
DARK_SURFACE = "#0f172a"
DARK_BG = "#020617"

SEQ_RATE = 18.5             # tCO2e/ha/năm (Tỷ suất hấp thụ rừng ngập mặn Cần Giờ)
BIOSPHERE_HA = 75740        # Tổng diện tích Khu dự trữ sinh quyển Cần Giờ (ha)
EV_KWH_PER_LITER = 1.7      # Tương đương kWh điện thay thế cho 1 lít nhiên liệu
ELEC_PRICE_VND = 2050.0     # VNĐ/kWh điện sản xuất
FUEL_PRICE_VND = 23500.0    # VNĐ/lít nhiên liệu
TREE_KG_CO2 = 25.0          # kg CO2/năm cho mỗi cây Đước đôi (Rhizophora apiculata)
TREE_PRICE_VND = 25000      # 25.000 VNĐ/cây đóng góp bảo tồn
VN_AVG_FOOTPRINT = 1.80     # tCO2/năm trung bình mỗi công dân Việt Nam
HOUSEHOLDS_PES = 1000       # 1.000+ hộ dân nhận khoán bảo vệ rừng Cần Giờ

INDUSTRIES = [
    "Sản xuất chế biến công nghiệp",
    "Logistics & Vận tải kho bãi",
    "Thương mại & Dịch vụ tổng hợp",
    "Bất động sản & Xây dựng công trình",
    "Nông lâm ngư nghiệp & Chế biến thực phẩm"
]

SCALES = [
    "Doanh nghiệp lớn (>500 nhân sự)",
    "Doanh nghiệp vừa (100 - 500 nhân sự)",
    "Doanh nghiệp nhỏ (<100 nhân sự)"
]

# 4 Bể carbon rừng ngập mặn Cần Giờ (theo nghiên cứu IPCC Wetlands)
POOLS_DATA = [
    ("Trầm tích hữu cơ yếm khí (Soil Blue Carbon)", 62.5),
    ("Sinh khối trên mặt đất (AGB - Thân, cành, lá)", 23.0),
    ("Sinh khối dưới mặt đất (BGB - Hệ rễ chống/thở)", 11.5),
    ("Vật rơi rụng & thảm mục ngập triều (Litter)", 3.0),
]

# Cấu hình 4 Nhóm người dùng (User Roles)
ROLES_CONFIG = {
    "corporate": {
        "key": "corporate",
        "name": "Nguyễn Minh Tuấn",
        "org": "Tập đoàn Công nghệ & Sản xuất Á Châu",
        "title": "Giám đốc ESG & Phát triển bền vững",
        "role_name": "Nhóm 1: Doanh nghiệp phát thải (Corporate)",
        "short_title": "Doanh nghiệp phát thải",
        "badge_text": "Doanh nghiệp (Scope 1 & 2)",
        "badge_color": EMERALD,
        "badge_bg": "rgba(6, 78, 59, 0.4)",
        "badge_border": "rgba(16, 185, 129, 0.4)",
        "purpose": "Đối tượng khách hàng cốt lõi cần giải quyết bài toán kiểm kê và tuân thủ giảm phát thải.",
        "icon": "🏢",
        "features": [
            "Nhập liệu điện lưới, xăng, dầu và tự động tính toán Scope 1, Scope 2",
            "Mô phỏng kịch bản cắt giảm phát thải (Solar, Logistics, EV, IoT)",
            "Xuất báo cáo ESG & LCA theo GHG Protocol / ISO 14064",
            "MỞ KHÓA SÀN GIAO DỊCH: Mua tín chỉ Blue Carbon bù đắp Net Zero",
        ],
    },
    "forest_authority": {
        "key": "forest_authority",
        "name": "TS. Lê Văn Thắng",
        "org": "Ban Quản Lý Khu Dự Trữ Sinh Quyển Cần Giờ",
        "title": "Trưởng phòng Quản lý Bảo tồn & Đo đạc MRV",
        "role_name": "Nhóm 2: Đơn vị quản lý / Chủ rừng Cần Giờ (Forest Authority)",
        "short_title": "BQL Rừng Cần Giờ",
        "badge_text": "Chủ rừng & BQL Cần Giờ",
        "badge_color": SKY_BLUE,
        "badge_bg": "rgba(7, 89, 133, 0.4)",
        "badge_border": "rgba(56, 189, 248, 0.4)",
        "purpose": "Đại diện phía cung (Supply side): cập nhật sinh khối và phát hành tín chỉ.",
        "icon": "🌲",
        "features": [
            "Cập nhật mật độ sinh khối, diện tích 35.120 ha rừng Cần Giờ",
            "Phát hành các đợt tín chỉ Blue Carbon mới (Verra VCS / Plan Vivo)",
            "Theo dõi sổ cái các lô đã phát hành và kiểm soát hạn mức",
            "Điều phối 95% doanh thu Quỹ PES chi trả cho 1.000+ hộ dân giữ rừng",
        ],
    },
    "citizen": {
        "key": "citizen",
        "name": "Trần Hoàng Nam",
        "org": "Cộng đồng Tình nguyện viên Net Zero TP.HCM",
        "title": "Công dân tiên phong Lối sống xanh",
        "role_name": "Nhóm 3: Người tiêu dùng / Cá nhân (Citizen)",
        "short_title": "Cá nhân & Người tiêu dùng",
        "badge_text": "Cá nhân / Người tiêu dùng",
        "badge_color": AMBER_GOLD,
        "badge_bg": "rgba(120, 53, 15, 0.4)",
        "badge_border": "rgba(245, 158, 11, 0.4)",
        "purpose": "Giáo dục cộng đồng, nâng cao nhận thức xã hội về lối sống Net Zero.",
        "icon": "👤",
        "features": [
            "Khảo sát dấu chân carbon cá nhân (Đi lại, điện sinh hoạt, ăn uống)",
            "So sánh với mức trung bình người Việt Nam (1.8 tCO2/năm)",
            "Chương trình cộng đồng: Góp cây giữ rừng Cần Giờ (25.000 VNĐ/cây)",
            "🔒 KHÓA SÀN GIAO DỊCH B2B: Chỉ dành riêng cho doanh nghiệp kiểm kê",
        ],
    },
    "admin": {
        "key": "admin",
        "name": "Phạm Quốc Hùng",
        "org": "Trung tâm Vận hành Quốc gia CarbonLens",
        "title": "Quản trị viên Hệ thống Cấp cao (Super Admin)",
        "role_name": "Nhóm 4: Quản trị viên hệ thống (Admin)",
        "short_title": "Quản trị viên Hệ thống",
        "badge_text": "Quản trị viên (Admin)",
        "badge_color": PURPLE,
        "badge_bg": "rgba(88, 28, 135, 0.4)",
        "badge_border": "rgba(192, 132, 252, 0.4)",
        "purpose": "Toàn quyền kiểm duyệt, quản lý tài khoản, cấu hình tham số hệ thống.",
        "icon": "🛡️",
        "features": [
            "Quản lý danh sách người dùng 4 nhóm và phân quyền sử dụng",
            "Cấu hình hệ số phát thải quốc gia (Bộ TN&MT) & Giá sàn tín chỉ",
            "Đối soát toàn bộ sổ cái giao dịch và cấp mã chứng nhận",
            "Toàn quyền truy cập tất cả các phân hệ của nền tảng",
        ],
    },
}

# ==============================================================================
# 3. BỘ CSS DARK LUXURY EMERALD TOÀN DIỆN (NỀN TỐI SANG TRỌNG & KÍNH PHÁT SÁNG)
# ==============================================================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    /* Ép nền tối toàn diện */
    html, body, .stApp, [data-testid="stAppViewContainer"], [data-testid="stHeader"] {
        background: #020617 !important;
        background-color: #020617 !important;
        color: #f8fafc !important;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
    }

    header[data-testid="stHeader"] {
        background-color: rgba(2, 6, 23, 0.85) !important;
        backdrop-filter: blur(12px) !important;
    }

    /* Thanh bên Sidebar */
    section[data-testid="stSidebar"] {
        background-color: #0b1329 !important;
        border-right: 1px solid rgba(16, 185, 129, 0.2) !important;
    }
    section[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p,
    section[data-testid="stSidebar"] label {
        color: #cbd5e1 !important;
        font-weight: 500 !important;
    }

    /* Tiêu đề */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Plus Jakarta Sans', sans-serif !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        letter-spacing: -0.02em !important;
    }

    /* Hệ thống Tabs đóng khung bo góc cao cấp */
    .stTabs [data-baseweb="tab-list"] {
        gap: 6px !important;
        background-color: rgba(15, 23, 42, 0.95) !important;
        padding: 6px !important;
        border-radius: 14px !important;
        border: 1px solid #1e293b !important;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 10px !important;
        padding: 9px 18px !important;
        font-weight: 600 !important;
        font-size: 0.9rem !important;
        color: #94a3b8 !important;
        border: 1px solid transparent !important;
        background-color: transparent !important;
        transition: all 0.2s ease !important;
    }
    .stTabs [data-baseweb="tab"]:hover {
        color: #34d399 !important;
        background-color: rgba(16, 185, 129, 0.1) !important;
    }
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        color: #ffffff !important;
        border-color: #34d399 !important;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
    }

    /* Nút bấm (Buttons) */
    .stButton > button, [data-testid="stFormSubmitButton"] > button {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 9px 20px !important;
        font-weight: 600 !important;
        font-size: 0.92rem !important;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3) !important;
        transition: all 0.2s ease !important;
    }
    .stButton > button:hover, [data-testid="stFormSubmitButton"] > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45) !important;
    }

    /* Khung nhập liệu */
    input, select, textarea, div[data-baseweb="select"] {
        background-color: #0f172a !important;
        color: #ffffff !important;
        border: 1px solid #334155 !important;
        border-radius: 10px !important;
    }
    input:focus, div[data-baseweb="select"]:focus {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25) !important;
    }
    label[data-testid="stWidgetLabel"] {
        color: #cbd5e1 !important;
        font-size: 0.88rem !important;
        font-weight: 600 !important;
    }

    /* Thẻ Hero Banner phát sáng */
    .hero-container {
        background: linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(15, 23, 42, 0.85) 100%);
        border: 1px solid rgba(16, 185, 129, 0.35);
        border-radius: 18px;
        padding: 24px 28px;
        margin-bottom: 22px;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(16, 185, 129, 0.12);
    }
    .badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(16, 185, 129, 0.18);
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        color: #34d399;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.04em;
    }

    /* Thẻ KPI Card Glassmorphism */
    .kpi-card {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 14px;
        padding: 16px 20px;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .kpi-card:hover {
        transform: translateY(-2px);
        border-color: rgba(16, 185, 129, 0.5);
    }
    .kpi-title {
        color: #94a3b8;
        font-size: 11px;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.05em;
        margin-bottom: 5px;
    }
    .kpi-value {
        color: #ffffff;
        font-size: 1.8rem;
        font-weight: 800;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: -0.02em;
    }

    /* Chứng nhận số sang trọng */
    .cert-frame {
        background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
        border: 2px solid rgba(16, 185, 129, 0.55);
        border-radius: 18px;
        padding: 26px 24px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(16, 185, 129, 0.15);
    }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 4. KHỞI TẠO TRẠNG THÁI PHIÊN (SESSION STATE)
# ==============================================================================
st.session_state.setdefault("logged_in", False)
st.session_state.setdefault("role", "corporate")
st.session_state.setdefault("company_name", "Tập đoàn Công nghệ & Sản xuất Á Châu")
st.session_state.setdefault("industry", INDUSTRIES[0])
st.session_state.setdefault("scale", SCALES[0])
st.session_state.setdefault("electricity_kwh", 350000.0)
st.session_state.setdefault("petrol_liters", 18000.0)
st.session_state.setdefault("diesel_liters", 25000.0)

st.session_state.setdefault("carbon_price", 15.0)
st.session_state.setdefault("floor_price", 14.0)
st.session_state.setdefault("usd_vnd_rate", 25400)
st.session_state.setdefault("grid_ef", 0.7221)
st.session_state.setdefault("petrol_ef", 2.3100)
st.session_state.setdefault("diesel_ef", 2.6800)
st.session_state.setdefault("pes_share", 95)

st.session_state.setdefault("ledger", [])
st.session_state.setdefault("last_cert", None)

st.session_state.setdefault("batches", [
    {"Mã lô": "CG-BLU-2026-A1", "Tên đợt": "Đợt 1 - Phân khu Vùng lõi Tam Thôn Hiệp", "Tiêu chuẩn": "Verra VCS (VM0033 Tidal Wetland)",
     "Khối lượng (tCO2e)": 150000.0, "Đã giao dịch": 87500.0, "Giá sàn ($)": 14.5, "Ngày": "15/01/2026"},
    {"Mã lô": "CG-BLU-2025-B4", "Tên đợt": "Đợt 4 - Rừng Đước đôi bãi bồi sông Lòng Tàu", "Tiêu chuẩn": "Plan Vivo Blue Carbon Standard",
     "Khối lượng (tCO2e)": 120000.0, "Đã giao dịch": 101600.0, "Giá sàn ($)": 13.0, "Ngày": "10/11/2025"},
    {"Mã lô": "CG-BLU-2026-C2", "Tên đợt": "Đợt 2 - Quần thể Mắm trắng Cần Thạnh & Long Hòa", "Tiêu chuẩn": "TCVN 13324:2025 Kiểm kê Blue Carbon",
     "Khối lượng (tCO2e)": 85000.0, "Đã giao dịch": 12000.0, "Giá sàn ($)": 15.0, "Ngày": "20/03/2026"},
])

st.session_state.setdefault("zones_df", pd.DataFrame({
    "Phân khu bảo tồn": ["Phân khu Vùng lõi nghiêm ngặt", "Phân khu Phục hồi sinh thái",
                         "Phân khu Vùng đệm phát triển", "Hành lang sông Lòng Tàu & Soài Rạp"],
    "Diện tích (ha)": [4721, 15600, 9260, 5539],
    "Loài cây ưu thế": ["Đước đôi, Dà quánh, Vẹt dù", "Đước đôi tái sinh, Cóc đỏ, Bần trắng",
                        "Mấm trắng, Bần chua, Dừa nước", "Thảm ngập triều hỗn giao bãi bồi"],
    "Mật độ trữ lượng (tCO2/ha)": [650.0, 548.0, 435.0, 398.0],
}))

st.session_state.setdefault("chat_history", [{
    "role": "assistant",
    "content": "Xin chào! Tôi là **Cố vấn Net Zero CarbonLens**. Dựa trên dữ liệu kiểm kê phát thải thực tế của doanh nghiệp, "
               "tôi sẵn sàng tư vấn giải pháp cắt giảm Scope 1 - 2, cơ chế bể hấp thụ Blue Carbon Cần Giờ và chiến lược tối ưu ngân sách ESG. Bạn cần hỗ trợ câu hỏi nào?"
}])

# ==============================================================================
# 5. HÀM TIỆN ÍCH HIỂN THỊ
# ==============================================================================
def format_vn(num: float, decimals: int = 1) -> str:
    """Định dạng số theo chuẩn Việt Nam (1.234.567,8)"""
    return f"{num:,.{decimals}f}".replace(",", "§").replace(".", ",").replace("§", ".")

def format_usd(num: float, decimals: int = 0) -> str:
    return f"${format_vn(num, decimals)}"

def style_plotly_dark(fig, height=300):
    fig.update_layout(
        height=height,
        template="plotly_dark",
        margin=dict(t=25, b=25, l=15, r=15),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Plus Jakarta Sans, sans-serif", color="#cbd5e1"),
        legend=dict(orientation="h", y=-0.22, x=0, title=None),
    )
    fig.update_xaxes(gridcolor="#1e293b", zeroline=False)
    fig.update_yaxes(gridcolor="#1e293b", zeroline=False)
    return fig

# ==============================================================================
# 6. TẦNG CỔNG ĐĂNG NHẬP (LOGIN GATEWAY LAYER)
# ==============================================================================
if not st.session_state.get("logged_in", False):
    st.markdown("""
    <div style="text-align: center; margin: 25px 0 35px 0;">
        <div class="badge-pill" style="font-size: 13px; padding: 6px 16px;">
            ✨ CỔNG ĐĂNG NHẬP PHÂN QUYỀN 4 NHÓM NGƯỜI DÙNG
        </div>
        <h1 style="color: #ffffff; font-size: 2.35rem; font-weight: 800; margin: 16px 0 10px 0; letter-spacing: -0.5px;">
            Chọn Vai Trò Để Bắt Đầu Trải Nghiệm Nền Tảng
        </h1>
        <p style="color: #94a3b8; font-size: 0.98rem; max-width: 820px; margin: 0 auto; line-height: 1.6;">
            Hệ thống tự động kích hoạt và mở khóa các công cụ chuyên biệt tùy theo nhóm tài khoản bạn lựa chọn. 
            Bạn có thể chuyển đổi linh hoạt vai trò bất cứ lúc nào trên thanh điều hướng sau khi đăng nhập.
        </p>
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3, col4 = st.columns(4, gap="medium")
    roles_order = ["corporate", "forest_authority", "citizen", "admin"]
    cols = [col1, col2, col3, col4]

    for idx, r_key in enumerate(roles_order):
        r_info = ROLES_CONFIG[r_key]
        with cols[idx]:
            features_html = "".join([
                f"<div style='font-size: 11px; color: #cbd5e1; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;'><span style='color: #10b981; font-weight: bold;'>✓</span><span style='line-height: 1.3;'>{f}</span></div>"
                for f in r_info["features"][:3]
            ])
            if r_key == "citizen":
                features_html += "<div style='font-size: 11px; color: #fbbf24; margin-top: 4px; font-weight: 600;'><span style='margin-right: 4px;'>🔒</span>Khóa sàn mua tín chỉ carbon B2B</div>"

            st.markdown(f"""
            <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 20px 18px; min-height: 485px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: {r_info['badge_bg']}; border: 1px solid {r_info['badge_border']}; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                            {r_info['icon']}
                        </div>
                        <span style="font-size: 10px; font-weight: 700; font-family: monospace; padding: 3px 8px; border-radius: 8px; background: {r_info['badge_bg']}; border: 1px solid {r_info['badge_border']}; color: {r_info['badge_color']};">
                            {r_info['badge_text']}
                        </span>
                    </div>

                    <h3 style="color: #ffffff; font-size: 1.05rem; font-weight: 700; margin: 0 0 8px 0; line-height: 1.3;">
                        {r_info['short_title']}
                    </h3>

                    <div style="color: #94a3b8; font-size: 11px; font-style: italic; border-left: 2px solid #334155; padding-left: 8px; margin-bottom: 12px; line-height: 1.4;">
                        "{r_info['purpose']}"
                    </div>

                    <div style="background: #020617; border: 1px solid #1e293b; border-radius: 10px; padding: 10px; margin-bottom: 14px;">
                        <div style="font-size: 9px; color: #64748b; font-family: monospace; text-transform: uppercase;">Tài khoản mẫu:</div>
                        <div style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-top: 2px;">{r_info['name']}</div>
                        <div style="font-size: 10px; color: #94a3b8;">{r_info['title']}</div>
                        <div style="font-size: 9px; color: #64748b; font-family: monospace; margin-top: 2px;">{r_info['org']}</div>
                    </div>

                    <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; font-family: monospace;">
                        Tính năng mở khóa:
                    </div>
                    {features_html}
                </div>
            </div>
            """, unsafe_allow_html=True)

            st.markdown("<div style='height: 8px;'></div>", unsafe_allow_html=True)
            if st.button(f"Đăng nhập vai trò này ➔", key=f"gateway_btn_{r_key}", use_container_width=True):
                st.session_state["logged_in"] = True
                st.session_state["role"] = r_key
                st.rerun()

    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #64748b; font-size: 12px; padding: 10px 0;">
        Hệ thống Kiểm kê Phát thải & Sàn Giao dịch Tín chỉ Blue Carbon Rừng Ngập Mặn Cần Giờ © 2026 · Chuẩn GHG Protocol & IPCC.
    </div>
    """, unsafe_allow_html=True)
    st.stop()

# ==============================================================================
# 7. THANH TRẠNG THÁI NGƯỜI DÙNG & THANH BÊN (LOGGED IN STATE)
# ==============================================================================
current_role_key = st.session_state.get("role", "corporate")
curr_role = ROLES_CONFIG.get(current_role_key, ROLES_CONFIG["corporate"])

# Thanh Banner Trạng Thái Cố Định
b_col1, b_col2 = st.columns([75, 25], vertical_alignment="center")
with b_col1:
    st.markdown(f"""
    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 9px; background: {curr_role['badge_bg']}; border: 1px solid {curr_role['badge_border']}; display: flex; align-items: center; justify-content: center; font-size: 17px;">
                {curr_role['icon']}
            </div>
            <div>
                <span style="color: #ffffff; font-weight: 700; font-size: 13px;">{curr_role['name']}</span>
                <span style="color: #64748b; margin: 0 4px;">·</span>
                <span style="color: #94a3b8; font-size: 12px;">{curr_role['org']}</span>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 700; font-family: monospace; padding: 3px 10px; border-radius: 20px; background: {curr_role['badge_bg']}; border: 1px solid {curr_role['badge_border']}; color: {curr_role['badge_color']};">
                ● {curr_role['badge_text']}
            </span>
        </div>
    </div>
    """, unsafe_allow_html=True)

with b_col2:
    sw_c1, sw_c2 = st.columns([6, 4])
    with sw_c1:
        new_role = st.selectbox(
            "Chuyển vai trò:",
            options=["corporate", "forest_authority", "citizen", "admin"],
            index=["corporate", "forest_authority", "citizen", "admin"].index(current_role_key),
            format_func=lambda x: ROLES_CONFIG[x]["short_title"],
            label_visibility="collapsed",
            key="header_role_switcher"
        )
        if new_role != current_role_key:
            st.session_state["role"] = new_role
            st.rerun()
    with sw_c2:
        if st.button("🚪 Đăng xuất", key="btn_logout", use_container_width=True):
            st.session_state["logged_in"] = False
            st.rerun()

# Thanh điều hướng Sidebar
with st.sidebar:
    st.markdown("""
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="font-size: 26px;">🌿</span>
        <div>
            <div style="font-size: 18px; font-weight: 800; color: #10b981; letter-spacing: -0.5px;">CarbonLens</div>
            <div style="font-size: 11px; color: #94a3b8;">Cần Giờ Blue Carbon Platform</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("##### 👤 VAI TRÒ NGƯỜI DÙNG (ROLE)")
    sb_role = st.radio(
        "Nhóm tài khoản đang dùng:",
        options=["corporate", "forest_authority", "citizen", "admin"],
        index=["corporate", "forest_authority", "citizen", "admin"].index(current_role_key),
        format_func=lambda x: ROLES_CONFIG[x]["short_title"],
        key="sidebar_role_radio"
    )
    if sb_role != current_role_key:
        st.session_state["role"] = sb_role
        st.rerun()

    st.markdown("---")
    st.markdown("##### ⚙️ THAM SỐ THỊ TRƯỜNG TÍN CHỈ")

    carbon_price = st.slider(
        "Giá tín chỉ carbon (USD/tCO2e):",
        min_value=float(st.session_state["floor_price"]),
        max_value=60.0,
        value=float(st.session_state["carbon_price"]),
        step=0.5,
        key="slider_carbon_price",
        help="Đơn giá tham chiếu theo thị trường tự nguyện VCM và các dự án Blue Carbon quốc tế."
    )
    st.session_state["carbon_price"] = carbon_price

    usd_vnd_rate = st.number_input(
        "Tỷ giá tham chiếu (USD/VNĐ):",
        min_value=23000,
        max_value=30000,
        value=int(st.session_state["usd_vnd_rate"]),
        step=100,
        key="input_usd_rate"
    )
    st.session_state["usd_vnd_rate"] = usd_vnd_rate

    st.markdown("---")
    st.markdown("##### 🧪 HỆ SỐ PHÁT THẢI QUỐC GIA")
    st.caption("Công bố theo Quyết định Bộ TN&MT và IPCC")
    st.text(f"• Điện lưới EVN: {st.session_state['grid_ef']:.4f} kg/kWh\n• Xăng RON 95: {st.session_state['petrol_ef']:.4f} kg/l\n• Dầu Diesel: {st.session_state['diesel_ef']:.4f} kg/l")

# ==============================================================================
# 8. MÔ HÌNH TÍNH TOÁN DÙNG CHUNG (CALCULATION ENGINE)
# ==============================================================================
company_name = st.session_state.get("company_name", "Tập đoàn Công nghệ & Sản xuất Á Châu")
electricity_kwh = float(st.session_state.get("electricity_kwh", 350000.0))
petrol_liters = float(st.session_state.get("petrol_liters", 18000.0))
diesel_liters = float(st.session_state.get("diesel_liters", 25000.0))

grid_ef = float(st.session_state["grid_ef"])
petrol_ef = float(st.session_state["petrol_ef"])
diesel_ef = float(st.session_state["diesel_ef"])
pes_share = int(st.session_state["pes_share"])

scope1_petrol_ton = (petrol_liters * petrol_ef) / 1000.0
scope1_diesel_ton = (diesel_liters * diesel_ef) / 1000.0
total_scope1_ton = scope1_petrol_ton + scope1_diesel_ton
total_scope2_ton = (electricity_kwh * grid_ef) / 1000.0
total_emissions_ton = total_scope1_ton + total_scope2_ton
offset_cost_usd = total_emissions_ton * carbon_price
offset_cost_vnd = offset_cost_usd * usd_vnd_rate

zones_df = st.session_state["zones_df"]
forest_ha = float(zones_df["Diện tích (ha)"].sum())
stock_mt = float((zones_df["Diện tích (ha)"] * zones_df["Mật độ trữ lượng (tCO2/ha)"]).sum() / 1e6)
annual_seq = forest_ha * SEQ_RATE

# ==============================================================================
# 9. HERO BANNER CHÍNH
# ==============================================================================
st.markdown("""
<div class="hero-container">
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
        <div style="max-width: 820px;">
            <div class="badge-pill">
                <span>🌱</span> UNESCO MANGROVE BIOSPHERE RESERVE & CIRCULAR CARBON
            </div>
            <h1 style="font-size: 2.1rem; margin: 12px 0 8px 0; color: #ffffff; line-height: 1.2;">
                CarbonLens: Phân Tích Phát Thải Doanh Nghiệp & Định Giá Tín Chỉ Rừng Cần Giờ
            </h1>
            <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.5;">
                Nền tảng nghiên cứu tích hợp quy đổi phát thải Scope 1 - Scope 2 theo GHG Protocol,
                giám sát bể trữ lượng Blue Carbon rừng ngập mặn Cần Giờ và mô phỏng giao dịch tín chỉ Net Zero.
            </p>
        </div>
        <div style="display: flex; gap: 12px; text-align: right;">
            <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; border-radius: 12px; padding: 12px 18px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Rừng phòng hộ</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #10b981; font-family: 'JetBrains Mono', monospace;">35.120 ha</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; border-radius: 12px; padding: 12px 18px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Công suất hấp thụ</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #38bdf8; font-family: 'JetBrains Mono', monospace;">~650.000 tCO2</div>
            </div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ==============================================================================
# 10. KHỞI TẠO TABS ĐỘNG DỰA TRÊN PHÂN QUYỀN
# ==============================================================================
if current_role_key == "citizen":
    tab1, tab2, tab3, tab_cit, tab4 = st.tabs([
        "1. Tính toán & Quy đổi Phát thải",
        "2. Giám sát Bể chứa Carbon Cần Giờ",
        "3. Sàn Giao dịch (🔒 Khóa)",
        "🌱 Dấu Chân Cá Nhân & Góp Cây",
        "4. Cố vấn Khoa học Net Zero"
    ])
elif current_role_key == "forest_authority":
    tab1, tab2, tab_fa, tab3, tab4 = st.tabs([
        "1. Tính toán & Quy đổi Phát thải",
        "2. Giám sát Bể chứa Carbon Cần Giờ",
        "🌲 BQL Cần Giờ & Phát Hành Tín Chỉ",
        "3. Sàn Giao dịch & Chứng nhận Bù đắp",
        "4. Cố vấn Khoa học Net Zero"
    ])
elif current_role_key == "admin":
    tab1, tab2, tab3, tab4, tab_fa, tab_adm = st.tabs([
        "1. Tính toán & Quy đổi Phát thải",
        "2. Giám sát Bể chứa Carbon Cần Giờ",
        "3. Sàn Giao dịch & Chứng nhận Bù đắp",
        "4. Cố vấn Khoa học Net Zero",
        "🌲 BQL Cần Giờ",
        "🛡️ Quản Trị Hệ Thống (Admin)"
    ])
else:
    tab1, tab2, tab3, tab4 = st.tabs([
        "1. Tính toán & Quy đổi Phát thải",
        "2. Giám sát Bể chứa Carbon Cần Giờ",
        "3. Sàn Giao dịch & Chứng nhận Bù đắp",
        "4. Cố vấn Khoa học Net Zero"
    ])

# ==============================================================================
# TAB 1: TÍNH TOÁN & QUY ĐỔI PHÁT THẢI (CARBON CALCULATOR)
# ==============================================================================
with tab1:
    col_input, col_kpi = st.columns([5, 7], gap="large")

    with col_input:
        st.markdown("#### 🏢 Thông Tin & Dữ Liệu Năng Lượng")

        new_company = st.text_input("Tên tổ chức / Doanh nghiệp:", value=company_name, key="in_company")
        st.session_state["company_name"] = new_company

        c_ind, c_scale = st.columns(2)
        with c_ind:
            st.selectbox("Ngành nghề kinh doanh:", INDUSTRIES, key="in_industry")
        with c_scale:
            st.selectbox("Quy mô tổ chức:", SCALES, key="in_scale")

        st.markdown("<div style='height: 8px;'></div>", unsafe_allow_html=True)
        st.markdown("##### ⚡ Tiêu Thụ Điện Năng (Scope 2 - Gián tiếp)")
        new_kwh = st.number_input(
            "Điện lưới EVN tiêu thụ (kWh/năm):",
            min_value=0.0,
            value=float(electricity_kwh),
            step=10000.0,
            format="%.0f",
            key="in_kwh",
            help="Điện mua từ lưới quốc gia phục vụ dây chuyền và văn phòng."
        )
        st.session_state["electricity_kwh"] = new_kwh

        st.markdown("##### ⛽ Nhiên Liệu Di Động & Vận Tải (Scope 1 - Trực tiếp)")
        c_pet, c_die = st.columns(2)
        with c_pet:
            new_pet = st.number_input(
                "Xăng RON 95 (lít/năm):",
                min_value=0.0,
                value=float(petrol_liters),
                step=1000.0,
                format="%.0f",
                key="in_petrol"
            )
            st.session_state["petrol_liters"] = new_pet
        with c_die:
            new_die = st.number_input(
                "Dầu Diesel (lít/năm):",
                min_value=0.0,
                value=float(diesel_liters),
                step=1000.0,
                format="%.0f",
                key="in_diesel"
            )
            st.session_state["diesel_liters"] = new_die

    with col_kpi:
        st.markdown("#### 📊 Tổng Hợp Kiểm Kê & Định Giá Bù Đắp")

        kpi_c1, kpi_c2, kpi_c3 = st.columns(3)
        with kpi_c1:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-title">SCOPE 1 (NHIÊN LIỆU)</div>
                <div class="kpi-value" style="color: #f59e0b;">{format_vn(total_scope1_ton)} <span style="font-size: 13px; color: #94a3b8;">t</span></div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Xăng + Dầu Diesel</div>
            </div>
            """, unsafe_allow_html=True)
        with kpi_c2:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-title">SCOPE 2 (ĐIỆN LƯỚI)</div>
                <div class="kpi-value" style="color: #38bdf8;">{format_vn(total_scope2_ton)} <span style="font-size: 13px; color: #94a3b8;">t</span></div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Lưới EVN 0.7221 kg/kWh</div>
            </div>
            """, unsafe_allow_html=True)
        with kpi_c3:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-title">TỔNG PHÁT THẢI</div>
                <div class="kpi-value" style="color: #10b981;">{format_vn(total_emissions_ton)} <span style="font-size: 13px; color: #94a3b8;">tCO2e</span></div>
                <div style="font-size: 11px; color: #34d399; margin-top: 4px;">Kiểm kê chuẩn IPCC</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, rgba(6, 78, 59, 0.35) 0%, rgba(15, 23, 42, 0.85) 100%); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 16px; padding: 20px 24px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
                        💰 TỔNG CHI PHÍ BÙ ĐẮP CARBON (OFFSET COST)
                    </div>
                    <div style="font-size: 2.1rem; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono', monospace;">
                        {format_usd(offset_cost_usd, 2)} USD
                    </div>
                    <div style="color: #cbd5e1; font-size: 0.95rem;">
                        Tương đương khoảng <b style="color: #f8fafc;">{format_vn(offset_cost_vnd, 0)} VNĐ</b> (@ ${carbon_price:.1f}/tấn)
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="badge-pill" style="margin-bottom: 6px;">DYNAMIC VALUATION</div>
                    <div style="font-size: 12px; color: #94a3b8;">Tỷ giá: 1 USD = {format_vn(usd_vnd_rate, 0)} VNĐ</div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Biểu đồ Donut Scope 1 vs Scope 2
        labels = ['Scope 1 (Xăng RON95)', 'Scope 1 (Dầu Diesel)', 'Scope 2 (Điện lưới EVN)']
        values = [scope1_petrol_ton, scope1_diesel_ton, total_scope2_ton]
        colors = ['#f59e0b', '#ef4444', '#38bdf8']

        fig_donut = go.Figure(data=[go.Pie(
            labels=labels,
            values=values,
            hole=.6,
            marker=dict(colors=colors, line=dict(color='#020617', width=2)),
            textinfo='percent+label',
            textposition='outside',
            insidetextorientation='radial'
        )])
        style_plotly_dark(fig_donut, height=270)
        st.plotly_chart(fig_donut, use_container_width=True)

    # --------------------------------------------------------------------------
    # MÔ PHỎNG KỊCH BẢN GIẢM PHÁT THẢI (DECARBONIZATION SIMULATION)
    # --------------------------------------------------------------------------
    st.markdown("---")
    st.markdown("#### 🎯 Mô Phỏng Kịch Bản Giảm Phát Thải & Tiết Kiệm Chi Phí (Decarbonization)")
    st.caption("Kéo các thanh trượt bên dưới để mô phỏng tác động giảm phát thải và dự toán ngân sách Opex được tối ưu:")

    col_sim_ctrl, col_sim_chart = st.columns([5, 7], gap="large")
    with col_sim_ctrl:
        sim_solar = st.slider("1. Điện mặt trời mái nhà Rooftop Solar (%):", 0, 100, 35, 5, key="sim_solar")
        sim_logistics = st.slider("2. Tối ưu hóa lộ trình & Reverse Logistics (%):", 0, 50, 20, 5, key="sim_logistics")
        sim_ev = st.slider("3. Điện hóa đội xe vận tải EV (%):", 0, 100, 25, 5, key="sim_ev")
        sim_eff = st.slider("4. Quản lý năng lượng thông minh & IoT (%):", 0, 30, 15, 5, key="sim_eff")

    keep_logistics = 1.0 - (sim_logistics / 100.0)
    sim_petrol = petrol_liters * keep_logistics * (1.0 - sim_ev / 100.0)
    sim_diesel = diesel_liters * keep_logistics * (1.0 - sim_ev / 100.0)
    ev_extra_kwh = (petrol_liters + diesel_liters) * keep_logistics * (sim_ev / 100.0) * EV_KWH_PER_LITER
    sim_grid_kwh = (electricity_kwh * (1.0 - sim_eff / 100.0) + ev_extra_kwh) * (1.0 - sim_solar / 100.0)

    sim_scope1 = (sim_petrol * petrol_ef + sim_diesel * diesel_ef) / 1000.0
    sim_scope2 = (sim_grid_kwh * grid_ef) / 1000.0
    sim_total = sim_scope1 + sim_scope2
    abated_ton = max(0.0, total_emissions_ton - sim_total)
    saved_offset_usd = abated_ton * carbon_price
    saved_kwh = max(0.0, electricity_kwh - sim_grid_kwh)
    saved_fuel = max(0.0, (petrol_liters + diesel_liters) - (sim_petrol + sim_diesel))
    opex_saved_vnd = (saved_kwh * ELEC_PRICE_VND) + (saved_fuel * FUEL_PRICE_VND)

    with col_sim_chart:
        res_c1, res_c2, res_c3 = st.columns(3)
        with res_c1:
            st.metric("Phát thải sau can thiệp", f"{format_vn(sim_total)} t", delta=f"-{format_vn(abated_ton)} tCO2e", delta_color="inverse")
        with res_c2:
            st.metric("Tiết kiệm mua tín chỉ", format_usd(saved_offset_usd), help="Giảm chi phí bù đắp hàng năm")
        with res_c3:
            st.metric("Tiết kiệm Opex điện/xăng", f"{format_vn(opex_saved_vnd / 1e6)} tr VNĐ", help="Tiết kiệm chi phí vận hành")

        df_sim = pd.DataFrame({
            "Kịch bản": ["Hiện trạng"] * 2 + ["Sau can thiệp"] * 2,
            "Hạng mục": ["Scope 1 (Nhiên liệu)", "Scope 2 (Điện lưới)"] * 2,
            "tCO2e": [total_scope1_ton, total_scope2_ton, sim_scope1, sim_scope2]
        })
        fig_sim = px.bar(df_sim, x="Kịch bản", y="tCO2e", color="Hạng mục", barmode="stack", text_auto=".1f",
                         color_discrete_map={"Scope 1 (Nhiên liệu)": "#f59e0b", "Scope 2 (Điện lưới)": "#38bdf8"})
        style_plotly_dark(fig_sim, height=250)
        st.plotly_chart(fig_sim, use_container_width=True)

    # --------------------------------------------------------------------------
    # XUẤT BÁO CÁO KIỂM KÊ (ESG & GHG PROTOCOL EXPORT)
    # --------------------------------------------------------------------------
    st.markdown("---")
    st.markdown("#### 📄 Xuất Báo Cáo Kiểm Kê Khí Nhà Kính Chuẩn ISO 14064-1 & GHG Protocol")
    report_code = f"GHG-{datetime.now().year}-{abs(hash(company_name)) % 9000 + 1000}"

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["BÁO CÁO KIỂM KÊ KHÍ NHÀ KÍNH (ISO 14064-1:2018 / GHG PROTOCOL)"])
    w.writerow(["Mã kiểm kê", report_code])
    w.writerow(["Tổ chức", company_name])
    w.writerow(["Ngành nghề", st.session_state.get("in_industry", INDUSTRIES[0])])
    w.writerow(["Thời gian xuất", datetime.now().strftime("%d/%m/%Y %H:%M:%S")])
    w.writerow([])
    w.writerow(["Hạng mục", "Mức tiêu thụ", "Đơn vị", "Hệ số phát thải (EF)", "Nguồn hệ số", "Phát thải (tCO2e)"])
    w.writerow(["Scope 1 - Xăng RON95", f"{petrol_liters:.0f}", "lít", f"{petrol_ef:.4f}", "IPCC Mobile Combustion", f"{scope1_petrol_ton:.2f}"])
    w.writerow(["Scope 1 - Dầu Diesel", f"{diesel_liters:.0f}", "lít", f"{diesel_ef:.4f}", "IPCC Mobile Combustion", f"{scope1_diesel_ton:.2f}"])
    w.writerow(["Scope 2 - Điện lưới EVN", f"{electricity_kwh:.0f}", "kWh", f"{grid_ef:.4f}", "Quyết định Bộ TN&MT", f"{total_scope2_ton:.2f}"])
    w.writerow([])
    w.writerow(["Tổng phát thải (tCO2e)", f"{total_emissions_ton:.2f}"])
    w.writerow(["Giá tín chỉ tham chiếu (USD)", f"{carbon_price:.2f}"])
    w.writerow(["Chi phí bù đắp Net Zero (USD)", f"{offset_cost_usd:.2f}"])
    w.writerow(["Chi phí quy đổi (VNĐ)", f"{offset_cost_vnd:.0f}"])

    with st.expander("👁️ Xem trước nội dung Báo cáo Kiểm kê"):
        st.markdown(f"""
        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; font-size: 13px; line-height: 1.7;">
            <b style="color: #10b981;">BÁO CÁO KIỂM KÊ KHÍ NHÀ KÍNH DOANH NGHIỆP</b> · Mã {report_code}<br>
            <b>Đơn vị kiểm kê:</b> {escape(company_name)} · <b>Kỳ kiểm kê:</b> {datetime.now().year}<br><br>
            • <b>Scope 1:</b> Xăng ({format_vn(petrol_liters, 0)} l) + Dầu ({format_vn(diesel_liters, 0)} l) = <b style="color: #f59e0b;">{format_vn(total_scope1_ton)} tCO2e</b><br>
            • <b>Scope 2:</b> Điện lưới EVN ({format_vn(electricity_kwh, 0)} kWh) = <b style="color: #38bdf8;">{format_vn(total_scope2_ton)} tCO2e</b><br>
            • <b>Tổng phát thải:</b> <b style="color: #10b981; font-size: 1.1rem;">{format_vn(total_emissions_ton)} tCO2e</b><br>
            • <b>Dự toán bù đắp Net Zero:</b> {format_usd(offset_cost_usd, 2)} USD (~{format_vn(offset_cost_vnd, 0)} VNĐ)
        </div>
        """, unsafe_allow_html=True)

    st.download_button(
        "📥 Tải Báo Cáo Kiểm Kê Đầy Đủ (CSV)",
        data=buf.getvalue().encode("utf-8-sig"),
        file_name=f"Bao_Cao_Kiem_Ke_{report_code}.csv",
        mime="text/csv",
        key="btn_download_esg"
    )

# ==============================================================================
# TAB 2: GIÁM SÁT BỂ CHỨA CARBON CẦN GIỜ & REVERSE LOGISTICS
# ==============================================================================
with tab2:
    st.markdown("#### 🌲 Khu Dự Trữ Sinh Quyển Rừng Ngập Mặn Cần Giờ (UNESCO)")
    st.caption("Được UNESCO công nhận năm 2000, 'Lá phổi xanh' Cần Giờ sở hữu khả năng cô lập carbon vượt trội gấp 4-6 lần rừng trên cạn.")

    # 4 Thẻ KPI Rừng
    rk_c1, rk_c2, rk_c3, rk_c4 = st.columns(4)
    with rk_c1:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">DIỆN TÍCH RỪNG BẢO TỒN</div>
            <div class="kpi-value" style="color: #10b981;">{format_vn(forest_ha, 0)} <span style="font-size: 13px; color: #94a3b8;">ha</span></div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Tổng sinh quyển: 75.740 ha</div>
        </div>
        """, unsafe_allow_html=True)
    with rk_c2:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">TỶ SUẤT HẤP THỤ THỰC ĐỊA</div>
            <div class="kpi-value" style="color: #38bdf8;">{SEQ_RATE} <span style="font-size: 13px; color: #94a3b8;">t/ha/năm</span></div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">MRV viễn thám Sentinel-2</div>
        </div>
        """, unsafe_allow_html=True)
    with rk_c3:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">CÔNG SUẤT HẤP THỤ MỖI NĂM</div>
            <div class="kpi-value" style="color: #fbbf24;">~{format_vn(round(annual_seq, -3), 0)} <span style="font-size: 13px; color: #94a3b8;">tCO2</span></div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Bảo vệ bãi bồi cửa sông</div>
        </div>
        """, unsafe_allow_html=True)
    with rk_c4:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">TỔNG TRỮ LƯỢNG TÍCH LŨY</div>
            <div class="kpi-value" style="color: #c084fc;">{format_vn(stock_mt, 2)} <span style="font-size: 13px; color: #94a3b8;">triệu t</span></div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Khóa trong bùn yếm khí</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<div style='height: 14px;'></div>", unsafe_allow_html=True)
    c_p1, c_p2 = st.columns(2, gap="large")
    with c_p1:
        st.markdown("##### 🧪 Cơ Cấu 4 Bể Chứa Carbon (Carbon Pools)")
        df_pools = pd.DataFrame(POOLS_DATA, columns=["Bể carbon", "Tỷ lệ (%)"])
        df_pools["Trữ lượng (triệu t)"] = (df_pools["Tỷ lệ (%)"] / 100.0) * stock_mt
        df_pools["Nhãn"] = df_pools["Tỷ lệ (%)"].map(lambda v: f"{v}%")

        fig_pools = px.bar(
            df_pools, x="Tỷ lệ (%)", y="Bể carbon", orientation="h", text="Nhãn",
            color="Tỷ lệ (%)", color_continuous_scale="Greens"
        )
        fig_pools.update_traces(textposition="outside")
        style_plotly_dark(fig_pools, height=270)
        fig_pools.update_layout(yaxis=dict(categoryorder="total ascending", title=None), xaxis=dict(range=[0, 75]))
        st.plotly_chart(fig_pools, use_container_width=True)
        st.caption("💡 62.5% carbon tập trung ở tầng trầm tích yếm khí ngập triều, có thể lưu trữ vĩnh viễn hàng trăm năm.")

    with c_p2:
        st.markdown("##### 📈 Dự Báo Hấp Thụ Carbon 10 Năm (2026 - 2035)")
        years = list(range(2026, 2036))
        scenarios = {
            "Hiện trạng bình thường": [annual_seq + i * 8500 for i in range(10)],
            "Trồng mới & Phục hồi tích cực": [annual_seq + i * 24000 + (i ** 1.2) * 3500 for i in range(10)],
            "Tác động biến đổi khí hậu": [annual_seq + i * 2000 - (i ** 1.4) * 2200 for i in range(10)]
        }
        fdf = pd.DataFrame([{"Năm": y, "tCO2/năm": v, "Kịch bản": k} for k, vals in scenarios.items() for y, v in zip(years, vals)])
        fig_scen = px.line(fdf, x="Năm", y="tCO2/năm", color="Kịch bản", markers=True,
                           color_discrete_sequence=[SKY_BLUE, EMERALD, ROSE_RED])
        style_plotly_dark(fig_scen, height=270)
        st.plotly_chart(fig_scen, use_container_width=True)

    st.markdown("##### 🗺️ Chi Tiết Trữ Lượng 4 Phân Khu Bảo Tồn")
    zv = zones_df.copy()
    zv["Trữ lượng (triệu tCO2)"] = (zv["Diện tích (ha)"] * zv["Mật độ trữ lượng (tCO2/ha)"] / 1e6).map(lambda v: format_vn(v, 2))
    zv["Diện tích (ha)"] = zv["Diện tích (ha)"].map(lambda v: format_vn(v, 0))
    zv["Mật độ trữ lượng (tCO2/ha)"] = zv["Mật độ trữ lượng (tCO2/ha)"].map(lambda v: format_vn(v, 1))
    st.dataframe(zv, use_container_width=True, hide_index=True)

    # Kinh tế tuần hoàn & Reverse Logistics
    st.markdown("---")
    st.markdown("#### 🔄 Kinh Tế Tuần Hoàn & Chu Trình Thu Hồi Biochar")
    flow_steps = [
        ("1. Thu gom tỉa thưa", "Cành Đước già cỗi tỉa thưa định kỳ và rác hữu cơ dạt vào bãi ngập triều."),
        ("2. Nhiệt phân yếm khí", "Chuyển hóa sinh khối gỗ thành Than sinh học (Biochar) ở nhiệt độ cao 500-600°C."),
        ("3. Hoàn nguyên nền đất", "Bón Biochar trở lại lớp trầm tích cửa sông để khóa chặt carbon vĩnh viễn hàng thiên niên kỷ."),
        ("4. Chi trả PES 95%", "95% nguồn thu từ tín chỉ carbon được Quỹ PES chuyển trực tiếp cho 1.000+ hộ dân giữ rừng.")
    ]
    f_cols = st.columns(4)
    for i, (title, desc) in enumerate(flow_steps):
        with f_cols[i]:
            st.markdown(f"""
            <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; min-height: 125px;">
                <b style="color: #10b981; font-size: 13px;">{title}</b>
                <p style="color: #94a3b8; font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">{desc}</p>
            </div>
            """, unsafe_allow_html=True)

# ==============================================================================
# TAB 3: SÀN GIAO DỊCH MÔ PHỎNG & CHỨNG NHẬN BÙ ĐẮP (TRADING HUB)
# ==============================================================================
with tab3:
    if current_role_key == "citizen":
        # ----------------------------------------------------------------------
        # MÀN HÌNH KHÓA PHÂN QUYỀN DÀNH CHO CÁ NHÂN (LOCKED SCREEN)
        # ----------------------------------------------------------------------
        st.markdown(f"""
        <div style="max-width: 760px; margin: 25px auto; background: #0f172a; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 20px; padding: 36px 30px; text-align: center; box-shadow: 0 15px 35px -10px rgba(0,0,0,0.7);">
            <div style="width: 70px; height: 70px; margin: 0 auto 16px auto; border-radius: 18px; background: rgba(120, 53, 15, 0.4); border: 2px solid rgba(245, 158, 11, 0.5); display: flex; align-items: center; justify-content: center; font-size: 34px; box-shadow: 0 0 25px rgba(245, 158, 11, 0.2);">
                🔒
            </div>
            <div class="badge-pill" style="color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); background: rgba(120, 53, 15, 0.3); margin-bottom: 12px;">
                PHÂN QUYỀN HỆ THỐNG · TÍNH NĂNG BỊ KHÓA
            </div>
            <h2 style="color: #ffffff; font-size: 1.6rem; font-weight: 800; margin: 0 0 10px 0;">
                Sàn Giao Dịch & Mua Tín Chỉ Carbon B2B (Retirement Hub)
            </h2>
            <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; max-width: 620px; margin: 0 auto 20px auto;">
                Theo quy định của GHG Protocol và Nghị định 06/2022/NĐ-CP, việc đặt mua và cấp Chứng nhận số bù đắp phát thải Scope 1 & 2 được thiết kế riêng cho các đơn vị Doanh nghiệp có tư cách pháp nhân kiểm kê. Tài khoản Cá nhân không có quyền thực hiện giao dịch mua tín chỉ B2B.
            </p>
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 18px; max-width: 500px; margin: 0 auto 24px auto; text-align: left; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid #1e293b;">
                    <span style="color: #94a3b8;">Vai trò hiện tại của bạn:</span>
                    <span style="color: #fbbf24; font-weight: bold; font-family: monospace;">Trần Hoàng Nam (Cá nhân)</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 8px;">
                    <span style="color: #94a3b8;">Yêu cầu vai trò:</span>
                    <span style="color: #10b981; font-weight: bold; font-family: monospace;">Doanh nghiệp phát thải hoặc Admin</span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        col_l1, col_l2 = st.columns([1, 1])
        with col_l1:
            if st.button("🏢 Chuyển sang vai trò Doanh nghiệp để mở khóa sàn B2B", key="btn_unlock_corp_in_tab", use_container_width=True):
                st.session_state["role"] = "corporate"
                st.rerun()
        with col_l2:
            st.info("👉 Bạn có thể chuyển sang Tab **'🌱 Dấu Chân Cá Nhân & Góp Cây'** để tham gia chương trình tài trợ cây Đước cộng đồng!")
    else:
        # ----------------------------------------------------------------------
        # SÀN GIAO DỊCH DÀNH CHO DOANH NGHIỆP & QUẢN TRỊ VIÊN
        # ----------------------------------------------------------------------
        total_supply = sum(b["Khối lượng (tCO2e)"] for b in st.session_state["batches"])
        total_traded = sum(b["Đã giao dịch"] for b in st.session_state["batches"])
        available_credits = max(0.0, total_supply - total_traded)

        st.markdown("#### 💼 Sàn Giao Dịch Tín Chỉ Carbon Mô Phỏng & Cấp Chứng Nhận Net Zero")
        st.caption("Doanh nghiệp lựa chọn gói bù đắp trực tiếp từ Bể tín chỉ Blue Carbon Rừng Cần Giờ để đạt trạng thái Trung hòa Carbon.")

        m_c1, m_c2, m_c3 = st.columns(3)
        with m_c1:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-title">TÍN CHỈ KHẢ DỤNG TRÊN SÀN</div>
                <div class="kpi-value" style="color: #38bdf8;">{format_vn(available_credits, 0)} <span style="font-size: 13px; color: #94a3b8;">tCO2e</span></div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Tổng phát hành: {format_vn(total_supply, 0)} t</div>
            </div>
            """, unsafe_allow_html=True)
        with m_c2:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-title">GIÁ NIÊM YẾT THỜI GIAN THỰC</div>
                <div class="kpi-value" style="color: #10b981;">{format_usd(carbon_price, 2)} <span style="font-size: 13px; color: #94a3b8;">/tấn</span></div>
                <div style="font-size: 11px; color: #34d399; margin-top: 4px;">Giá sàn bảo hộ: ${st.session_state['floor_price']:.1f}</div>
            </div>
            """, unsafe_allow_html=True)
        with m_c3:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-title">PHÁT THẢI CẦN BÙ ĐẮP</div>
                <div class="kpi-value" style="color: #f59e0b;">{format_vn(total_emissions_ton)} <span style="font-size: 13px; color: #94a3b8;">tCO2e</span></div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Scope 1 + Scope 2</div>
            </div>
            """, unsafe_allow_html=True)

        # Biểu đồ Dự Báo Giá Tín Chỉ AI
        st.markdown("<div style='height: 14px;'></div>", unsafe_allow_html=True)
        with st.expander("📈 Dự Báo Biến Động Giá Tín Chỉ Bằng AI & Mô Hình Hedging", expanded=False):
            fc_factors = [("T-9", 0.77, "Lịch sử"), ("T-6", 0.85, "Lịch sử"), ("T-3", 0.93, "Lịch sử"), ("Hiện tại", 1.0, "Hiện tại"),
                          ("+3 tháng", 1.23, "Dự báo"), ("+6 tháng", 1.65, "Dự báo"), ("+12 tháng", 2.20, "Dự báo")]
            fc_df = pd.DataFrame([{"Mốc thời gian": m, "Đơn giá ($)": carbon_price * f, "Loại dữ liệu": t} for m, f, t in fc_factors])
            fig_fc = px.bar(fc_df, x="Mốc thời gian", y="Đơn giá ($)", color="Loại dữ liệu", text_auto=".1f",
                            color_discrete_map={"Lịch sử": "#64748b", "Hiện tại": EMERALD, "Dự báo": AMBER_GOLD})
            style_plotly_dark(fig_fc, height=260)
            st.plotly_chart(fig_fc, use_container_width=True)
            st.caption("💡 Dự báo chịu tác động từ Cơ chế CBAM Châu Âu và Kế hoạch vận hành Sàn Carbon Quốc gia Việt Nam.")

        # Lệnh Đặt Mua & Chứng Nhận Bù Đắp
        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
        t_col1, t_col2 = st.columns([6, 6], gap="large")

        with t_col1:
            st.markdown("##### 🛒 Lệnh Đặt Mua Tín Chỉ Carbon")
            order_mode = st.radio(
                "Lựa chọn tỷ lệ bù đắp:",
                ["Bù đắp 100% (Đạt Net Zero hoàn toàn)", "Bù đắp 75% (Mục tiêu ESG tiên phong)", "Bù đắp 50% (Tuân thủ tối thiểu)", "Tự nhập khối lượng"],
                key="radio_order_mode"
            )

            if "100%" in order_mode:
                order_tons = total_emissions_ton
            elif "75%" in order_mode:
                order_tons = total_emissions_ton * 0.75
            elif "50%" in order_mode:
                order_tons = total_emissions_ton * 0.50
            else:
                order_tons = st.number_input("Số lượng tín chỉ muốn mua (tCO2e):", min_value=1.0, max_value=float(available_credits), value=min(100.0, float(available_credits)), step=10.0)

            order_cost_usd = order_tons * carbon_price
            order_cost_vnd = order_cost_usd * usd_vnd_rate
            pes_fund_usd = order_cost_usd * (pes_share / 100.0)
            mrv_fund_usd = order_cost_usd * ((100.0 - pes_share) / 100.0)

            st.markdown(f"""
            <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 18px; margin: 12px 0; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid #1e293b;">
                    <span style="color: #94a3b8;">Khối lượng mua:</span>
                    <b style="color: #f8fafc; font-family: monospace;">{format_vn(order_tons, 2)} tCO2e</b>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b;">
                    <span style="color: #94a3b8;">Tổng thanh toán (USD):</span>
                    <b style="color: #10b981; font-family: monospace;">{format_usd(order_cost_usd, 2)}</b>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b;">
                    <span style="color: #94a3b8;">Quy đổi VNĐ:</span>
                    <b style="color: #38bdf8; font-family: monospace;">{format_vn(order_cost_vnd, 0)} VNĐ</b>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b;">
                    <span style="color: #94a3b8;">Trong đó Quỹ PES ({pes_share}%):</span>
                    <span style="color: #fbbf24; font-family: monospace;">{format_usd(pes_fund_usd, 2)} (1.000+ hộ dân)</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 6px;">
                    <span style="color: #94a3b8;">Duy trì MRV viễn thám ({100 - pes_share}%):</span>
                    <span style="color: #cbd5e1; font-family: monospace;">{format_usd(mrv_fund_usd, 2)}</span>
                </div>
            </div>
            """, unsafe_allow_html=True)

            can_buy = (total_emissions_ton > 0) and (order_tons <= available_credits) and (order_tons > 0)
            if st.button("Xác Nhận Mua & Khóa Tiêu Hủy Tín Chỉ (Retire)", disabled=not can_buy, use_container_width=True, key="btn_execute_trade"):
                cert_id = f"CG-BLU-{datetime.now().strftime('%Y%m%d')}-{abs(hash(company_name + str(order_tons))) % 9000 + 1000}"
                now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

                st.session_state["ledger"].append({
                    "Thời điểm": now_str,
                    "Bên mua": company_name,
                    "Khối lượng (tCO2e)": order_tons,
                    "Đơn giá ($)": carbon_price,
                    "Tổng tiền ($)": order_cost_usd,
                    "Quỹ PES ($)": pes_fund_usd,
                    "Mã chứng nhận": cert_id
                })

                st.session_state["last_cert"] = {
                    "id": cert_id,
                    "company": company_name,
                    "tons": order_tons,
                    "pct": (order_tons / total_emissions_ton) * 100.0,
                    "remaining": max(0.0, total_emissions_ton - order_tons),
                    "cost_usd": order_cost_usd,
                    "time": now_str
                }
                st.success(f"🎉 Giao dịch thành công! Doanh nghiệp **{company_name}** đã chính thức bù đắp **{format_vn(order_tons, 2)} tCO2e**.")
                st.balloons()
                st.rerun()

        with t_col2:
            st.markdown("##### 📜 Chứng Nhận Số Bù Đắp Carbon (Digital Certificate)")
            cert = st.session_state.get("last_cert", None)
            if cert:
                st.markdown(f"""
                <div class="cert-frame">
                    <div style="font-size: 11px; font-weight: 700; color: #10b981; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase;">
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM · MRV REGISTRY
                    </div>
                    <h3 style="color: #ffffff; font-size: 1.35rem; margin: 10px 0 4px 0;">CHỨNG NHẬN TRUNG HÒA CARBON</h3>
                    <div style="font-size: 11px; color: #94a3b8; margin-bottom: 16px;">BLUE CARBON RETIREMENT CERTIFICATE</div>
                    <div style="font-size: 12px; color: #cbd5e1;">Chứng nhận cấp cho:</div>
                    <div style="font-size: 1.25rem; font-weight: 800; color: #34d399; margin: 4px 0 12px 0;">{escape(cert['company'])}</div>
                    <div style="font-size: 2.2rem; font-weight: 800; color: #ffffff; font-family: 'JetBrains Mono', monospace;">
                        {format_vn(cert['tons'], 2)} <span style="font-size: 1.1rem; color: #10b981;">tCO2e</span>
                    </div>
                    <div style="font-size: 12px; color: #cbd5e1; margin-top: 6px;">
                        Tỷ lệ hoàn thành: <b style="color: #38bdf8;">{format_vn(cert['pct'])}%</b> phát thải kiểm kê
                    </div>
                    <div style="border-top: 1px solid #1e293b; margin-top: 16px; padding-top: 12px; text-align: left; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                        • <b>Mã chứng nhận duy nhất:</b> <code style="color: #34d399;">{cert['id']}</code><br>
                        • <b>Thời điểm cấp & khóa sổ cái:</b> {cert['time']}<br>
                        • <b>Dự án thụ hưởng:</b> Bể sinh quyển Rừng ngập mặn Cần Giờ (35.120 ha)<br>
                        • <b>Trạng thái:</b> Đã tiêu hủy (Permanently Retired), chống tính trùng 100%.
                    </div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown("""
                <div style="background: #0f172a; border: 1px dashed #334155; border-radius: 16px; padding: 50px 20px; text-align: center; color: #94a3b8;">
                    <div style="font-size: 32px; margin-bottom: 10px;">📜</div>
                    <b style="color: #cbd5e1;">Chưa có chứng nhận được cấp trong phiên này</b>
                    <p style="font-size: 12px; margin-top: 6px;">
                        Hãy hoàn tất lệnh đặt mua ở cột bên trái để hệ thống khóa sổ cái chuỗi khối và xuất Giấy chứng nhận số chính thức.
                    </p>
                </div>
                """, unsafe_allow_html=True)

# ==============================================================================
# TAB DÀNH CHO CÁ NHÂN: DẤU CHÂN CARBON & GÓP CÂY CẦN GIỜ (CITIZEN)
# ==============================================================================
if current_role_key == "citizen":
    with tab_cit:
        st.markdown("#### 🌱 Tra Cứu Dấu Chân Carbon Cá Nhân & Góp Cây Giữ Rừng Cần Giờ")
        st.caption("Khảo sát thói quen sinh hoạt và chung tay cùng 1.000+ hộ dân bảo tồn rừng ngập mặn Cần Giờ.")

        c_calc, c_tree = st.columns([6, 6], gap="large")
        with c_calc:
            st.markdown("##### 🚗 1. Khảo Sát Thói Quen Đi Lại & Tiêu Dùng Năng Lượng")
            c_trans = st.selectbox("Phương tiện di chuyển chính hàng ngày:",
                                   ["Xe máy xăng (55g CO2/km)", "Ô tô xăng (170g CO2/km)", "Xe điện EV (65g CO2/km)", "Xe buýt / Metro công cộng (35g CO2/km)"],
                                   key="cit_trans")
            c_km = st.slider("Quãng đường đi lại trung bình (km/ngày):", 0, 100, 20, key="cit_km")
            c_kwh = st.slider("Tiêu thụ điện sinh hoạt gia đình (kWh/tháng):", 50, 600, 180, key="cit_kwh")
            c_diet = st.selectbox("Chế độ dinh dưỡng phổ biến:",
                                  ["Nhiều thịt bò/thịt đỏ (2.1 tCO2/năm)", "Cân bằng thịt và rau (1.4 tCO2/năm)", "Ăn chay / Ưu tiên thực vật (0.8 tCO2/năm)"],
                                  key="cit_diet")

            trans_factor = 0.055 if "Xe máy" in c_trans else (0.170 if "Ô tô" in c_trans else 0.04)
            diet_factor = 2.1 if "Nhiều thịt" in c_diet else (1.4 if "Cân bằng" in c_diet else 0.8)
            personal_annual_tco2 = ((c_km * 365 * trans_factor) + (c_kwh * 12 * grid_ef)) / 1000.0 + diet_factor
            delta_vn = ((personal_annual_tco2 - VN_AVG_FOOTPRINT) / VN_AVG_FOOTPRINT) * 100.0

            st.markdown(f"""
            <div class="kpi-card" style="margin-top: 14px;">
                <div class="kpi-title">DẤU CHÂN CARBON CÁ NHÂN CỦA BẠN</div>
                <div class="kpi-value" style="color: #fbbf24;">{format_vn(personal_annual_tco2, 2)} <span style="font-size: 13px; color: #94a3b8;">tCO2/năm</span></div>
                <div style="font-size: 12px; color: #cbd5e1; margin-top: 6px;">
                    {f"<span style='color: #f43f5e;'>Cao hơn {format_vn(abs(delta_vn), 0)}%</span> so với mức trung bình người Việt (1.80 tCO2/năm)" if delta_vn > 0 else f"<span style='color: #10b981;'>Thấp hơn {format_vn(abs(delta_vn), 0)}%</span> so với mức trung bình người Việt (1.80 tCO2/năm)"}
                </div>
            </div>
            """, unsafe_allow_html=True)

        with c_tree:
            st.markdown("##### 🌳 2. Chương Trình Cộng Đồng: 'Góp Cây Giữ Rừng Cần Giờ'")
            st.markdown("""
            <div style="background: rgba(6, 78, 59, 0.35); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 14px; padding: 16px; margin-bottom: 14px; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                Mỗi cây Đước đôi (Rhizophora apiculata) trồng mới tại bãi bồi Cần Giờ giúp hấp thụ khoảng <b>25 kg CO2/năm</b>.
                Kinh phí đóng góp (25.000 VNĐ/cây) được chuyển thẳng vào <b>Quỹ PES</b> hỗ trợ trực tiếp sinh kế 1.000+ hộ dân bảo vệ rừng.
            </div>
            """, unsafe_allow_html=True)

            cit_trees = st.number_input("Số lượng cây Đước bạn muốn tài trợ bảo tồn:", min_value=1, max_value=500, value=2, step=1, key="num_cit_trees")
            cit_cost_vnd = cit_trees * TREE_PRICE_VND
            cit_co2_kg = cit_trees * TREE_KG_CO2

            st.markdown(f"""
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; margin-bottom: 14px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="color: #94a3b8;">Mức đóng góp (25.000đ/cây):</span>
                    <b style="color: #10b981; font-family: monospace;">{format_vn(cit_cost_vnd, 0)} VNĐ</b>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="color: #94a3b8;">Lượng CO2 hấp thụ bù trừ:</span>
                    <b style="color: #38bdf8; font-family: monospace;">~{format_vn(cit_co2_kg, 0)} kg CO2/năm</b>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #94a3b8;">Hỗ trợ trực tiếp:</span>
                    <span style="color: #f8fafc;">1.000+ hộ dân bảo vệ rừng Cần Giờ</span>
                </div>
            </div>
            """, unsafe_allow_html=True)

            if st.button("🤝 Xác Nhận Đóng Góp & Nhận Chứng Nhận Sống Xanh", use_container_width=True, key="btn_sponsor_trees"):
                st.session_state["ledger"].append({
                    "Thời điểm": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                    "Bên mua": f"Công dân {curr_role['name']}",
                    "Khối lượng (tCO2e)": cit_co2_kg / 1000.0,
                    "Đơn giá ($)": 0.0,
                    "Tổng tiền ($)": cit_cost_vnd / usd_vnd_rate,
                    "Quỹ PES ($)": cit_cost_vnd / usd_vnd_rate,
                    "Mã chứng nhận": f"CG-CITIZEN-{abs(hash(str(cit_trees) + datetime.now().isoformat())) % 9000 + 1000}"
                })
                st.success(f"🎉 Cảm ơn bạn **{curr_role['name']}**! Bạn đã tài trợ thành công **{cit_trees} cây Đước đôi** cho rừng ngập mặn Cần Giờ.")
                st.balloons()

# ==============================================================================
# TAB DÀNH CHO BQL RỪNG: QUẢN LÝ BỂ CHỨA & PHÁT HÀNH TÍN CHỈ (FOREST AUTHORITY)
# ==============================================================================
if current_role_key in ("forest_authority", "admin"):
    with tab_fa:
        st.markdown("#### 🌲 Ban Quản Lý Khu Dự Trữ Sinh Quyển Cần Giờ & Phát Hành Tín Chỉ")
        st.caption("Cập nhật mật độ sinh khối 35.120 ha rừng, thẩm tra lô tín chỉ mới và theo dõi phân bổ Quỹ PES cộng đồng.")

        fa_col1, fa_col2 = st.columns([6, 6], gap="large")
        with fa_col1:
            st.markdown("##### 🗺️ 1. Hiệu Chỉnh Mật Độ Sinh Khối Thực Địa 4 Phân Khu")
            st.caption("BQL có quyền điều chỉnh số liệu đo đạc thực tế định kỳ:")
            edited_zones = st.data_editor(
                st.session_state["zones_df"][["Phân khu bảo tồn", "Diện tích (ha)", "Mật độ trữ lượng (tCO2/ha)"]],
                disabled=["Phân khu bảo tồn", "Diện tích (ha)"],
                hide_index=True,
                use_container_width=True,
                key="editor_zones"
            )
            if st.button("💾 Lưu Cập Nhật Mật Độ Sinh Khối", key="btn_save_biomass"):
                new_z = st.session_state["zones_df"].copy()
                new_z["Mật độ trữ lượng (tCO2/ha)"] = edited_zones["Mật độ trữ lượng (tCO2/ha)"].astype(float).values
                st.session_state["zones_df"] = new_z
                st.success("✅ Đã cập nhật mật độ sinh khối mới! Dữ liệu đã đồng bộ sang phân hệ Bể chứa Cần Giờ.")
                st.rerun()

        with fa_col2:
            st.markdown("##### ➕ 2. Phát Hành Đợt Tín Chỉ Blue Carbon Mới Lên Sàn")
            new_batch_name = st.text_input("Tên đợt / Phân đoạn phát hành:", value="Đợt 3 - Khu phục hồi sinh thái An Thới Đông", key="in_batch_name")
            new_batch_std = st.selectbox("Tiêu chuẩn Thẩm định & Xác thực:",
                                         ["Verra VCS (VM0033 Tidal Wetland Restoration)", "Plan Vivo Blue Carbon Standard", "TCVN 13324:2025 Kiểm kê Blue Carbon Cần Giờ"],
                                         key="in_batch_std")
            b_c1, b_c2 = st.columns(2)
            with b_c1:
                new_batch_tons = st.number_input("Khối lượng phát hành (tCO2e):", min_value=1000.0, value=50000.0, step=5000.0, key="in_batch_tons")
            with b_c2:
                new_batch_price = st.number_input("Giá sàn đề xuất ($/tCO2):", min_value=float(st.session_state["floor_price"]), value=15.0, step=0.5, key="in_batch_price")

            if st.button("📤 Phát Hành Lô Tín Chỉ Mới Lên Sàn", use_container_width=True, key="btn_issue_batch"):
                new_id = f"CG-BLU-2026-{chr(65 + len(st.session_state['batches']))}{len(st.session_state['batches']) + 1}"
                st.session_state["batches"].insert(0, {
                    "Mã lô": new_id,
                    "Tên đợt": new_batch_name.strip(),
                    "Tiêu chuẩn": new_batch_std,
                    "Khối lượng (tCO2e)": new_batch_tons,
                    "Đã giao dịch": 0.0,
                    "Giá sàn ($)": new_batch_price,
                    "Ngày": datetime.now().strftime("%d/%m/%Y")
                })
                st.success(f"🎉 Phát hành thành công lô **{new_id}** ({format_vn(new_batch_tons, 0)} tCO2e @ ${new_batch_price}/tấn) vào Sổ cái Registry!")
                st.rerun()

        st.markdown("<div style='height: 14px;'></div>", unsafe_allow_html=True)
        st.markdown("##### 📜 Sổ Cái Các Lô Tín Chỉ Đang Lưu Hành")
        st.dataframe(pd.DataFrame(st.session_state["batches"]), use_container_width=True, hide_index=True)

        # Quỹ PES
        st.markdown("---")
        st.markdown("#### 👥 Theo Dõi Giải Ngân Quỹ Dịch Vụ Môi Trường Rừng (PES 95%)")
        total_pes_usd = sum(t.get("Quỹ PES ($)", 0.0) for t in st.session_state["ledger"])
        pes_p1, pes_p2, pes_p3 = st.columns(3)
        with pes_p1:
            st.metric("Tổng Quỹ PES Đã Giải Ngân", format_usd(total_pes_usd, 2))
        with pes_p2:
            st.metric("Quy đổi tiền đồng", f"{format_vn((total_pes_usd * usd_vnd_rate) / 1e6, 1)} triệu VNĐ")
        with pes_p3:
            st.metric("Bình quân hỗ trợ mỗi hộ", f"{format_vn((total_pes_usd * usd_vnd_rate) / HOUSEHOLDS_PES, 0)} VNĐ/hộ", help="1.000+ hộ nhận khoán giữ rừng")

# ==============================================================================
# TAB DÀNH CHO ADMIN: TRUNG TÂM QUẢN TRỊ TOÀN HỆ THỐNG (SUPER ADMIN)
# ==============================================================================
if current_role_key == "admin":
    with tab_adm:
        st.markdown("#### 🛡️ Trung Tâm Quản Trị Hệ Thống (Super Admin Control Center)")
        st.caption("Quản trị tài khoản 4 nhóm người dùng, kiểm duyệt dữ liệu phát thải và cấu hình tham số toàn cục.")

        adm_col1, adm_col2 = st.columns([7, 5], gap="large")
        with adm_col1:
            st.markdown("##### 👥 Danh Sách & Phân Quyền 4 Nhóm Người Dùng")
            users_data = [
                {"Người dùng": r["name"], "Đơn vị": r["org"], "Vai trò": r["short_title"], "Trạng thái": "Đang hoạt động"}
                for r in ROLES_CONFIG.values()
            ]
            st.dataframe(pd.DataFrame(users_data), use_container_width=True, hide_index=True)

            st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
            st.markdown("##### 📑 Sổ Cái Giao Dịch Toàn Hệ Thống (Auditing Ledger)")
            if st.session_state["ledger"]:
                st.dataframe(pd.DataFrame(st.session_state["ledger"]), use_container_width=True, hide_index=True)
            else:
                st.info("Chưa có giao dịch nào được ghi nhận trong phiên làm việc này.")

        with adm_col2:
            st.markdown("##### ⚙️ Cấu Hình Tham Số Toàn Cục")
            with st.form("form_admin_params"):
                new_grid_ef = st.number_input("Hệ số phát thải lưới điện (Bộ TN&MT) kg/kWh:", value=float(st.session_state["grid_ef"]), step=0.0001, format="%.4f")
                new_floor_price = st.number_input("Giá sàn tín chỉ Blue Carbon tối thiểu ($/tấn):", value=float(st.session_state["floor_price"]), step=0.5)
                new_pes_share = st.slider("Tỷ lệ phân bổ Quỹ PES cho hộ dân (%):", 80, 99, int(st.session_state["pes_share"]))

                if st.form_submit_button("💾 Lưu Tham Số Toàn Hệ Thống", type="primary", use_container_width=True):
                    st.session_state["grid_ef"] = new_grid_ef
                    st.session_state["floor_price"] = new_floor_price
                    st.session_state["pes_share"] = new_pes_share
                    st.session_state["carbon_price"] = max(st.session_state["carbon_price"], new_floor_price)
                    st.success("✅ Đã cập nhật và áp dụng tham số mới cho toàn bộ công cụ tính toán!")
                    st.rerun()

# ==============================================================================
# TAB 4: CỐ VẤN KHOA HỌC NET ZERO (AI CONSULTANT)
# ==============================================================================
def generate_advisor_answer(q: str, c_name: str, total_t: float, s1_t: float, s2_t: float, cost_u: float, p_usd: float) -> str:
    ql = q.lower()
    if any(w in ql for w in ["giải pháp", "cắt giảm", "đánh giá", "lộ trình"]):
        return (f"**Đánh giá tổng quan cho {c_name}:**\n\n"
                f"- **Tổng phát thải hiện tại:** `{format_vn(total_t)} tCO2e/năm` (Scope 1 chiếm {format_vn(s1_t/total_t*100 if total_t>0 else 0)}%, Scope 2 chiếm {format_vn(s2_t/total_t*100 if total_t>0 else 0)}%).\n"
                f"- **Dự toán chi phí bù đắp:** `{format_usd(cost_u)} USD` (@ ${p_usd}/tấn).\n\n"
                "**3 Trụ cột cắt giảm khuyến nghị:**\n"
                "1. **Điện mặt trời mái nhà (Rooftop Solar):** Cắt giảm 30-40% lượng điện lưới EVN mua vào trong giờ cao điểm.\n"
                "2. **Điện hóa đội xe vận tải & Tối ưu logistics:** Giảm tiêu hao xăng dầu động cơ đốt trong theo lộ trình Net Zero 2050.\n"
                "3. **Mua tín chỉ Blue Carbon Cần Giờ:** Bù đắp lượng phát thải khó triệt tiêu (Residual Emissions) và hoàn thiện báo cáo ESG.")
    elif any(w in ql for w in ["tại sao", "blue carbon", "gấp", "ngập mặn", "hấp thụ"]):
        return ("**Lý do Blue Carbon Cần Giờ hấp thụ vượt trội gấp 4-6 lần rừng trên cạn:**\n\n"
                "- **Trầm tích yếm khí:** Nước ngập triều làm thiếu hụt oxy, ngăn chặn vi sinh vật phân hủy chất hữu cơ, giúp carbon tích tụ hàng thiên niên kỷ mà không bị giải phóng vào khí quyển (chiếm 62.5% tổng trữ lượng).\n"
                "- **Bộ rễ chống/thở dày đặc:** Hệ rễ Đước và Mấm giữ lại phù sa hữu cơ thượng nguồn đổ về từ sông Lòng Tàu và Soài Rạp.\n"
                "- **Sinh trưởng liên tục:** Khí hậu cận xích đạo cho phép cây quang hợp và bồi đắp sinh khối quanh năm.")
    elif any(w in ql for w in ["double counting", "tính trùng", "retire", "tiêu hủy"]):
        return ("**Cơ chế bảo vệ chống tính trùng (Anti Double Counting) của hệ thống:**\n\n"
                "- Mỗi lô tín chỉ được cấp một **Mã định danh duy nhất (Unique Serial ID)** và gắn nhãn theo tiêu chuẩn quốc tế (Verra VCS / Plan Vivo).\n"
                "- Khi doanh nghiệp hoàn tất bù đắp, số tín chỉ đó được chuyển vào trạng thái **Permanently Retired (Đã tiêu hủy)** trên Sổ cái chuỗi khối, không thể bán lại hay chuyển nhượng lần thứ hai.")
    elif any(w in ql for w in ["ngân sách", "giá", "cbam", "chi phí"]):
        return (f"**Chiến lược tối ưu hóa ngân sách ESG (@ ${p_usd}/tấn):**\n\n"
                "- Xu hướng giá tín chỉ tự nguyện quốc tế và thị trường tuân thủ Châu Âu (CBAM) dự kiến tăng lên mốc 25-35 USD vào giai đoạn 2027-2030.\n"
                "- Doanh nghiệp nên cân nhắc ký hợp đồng mua trước (Forward Contract) khoảng 50-75% khối lượng bù đắp để khóa mức giá sàn ưu đãi của rừng Cần Giờ.")
    else:
        return (f"Chào bạn! Dựa trên hồ sơ của **{c_name}** ({format_vn(total_t)} tCO2e), rừng ngập mặn Cần Giờ có nguồn cung dồi dào (~650.000 tCO2e/năm) đủ điều kiện cấp tín chỉ bù đắp. "
                "Bạn có thể chọn các câu hỏi gợi ý bên phải hoặc nhập câu hỏi cụ thể về kiểm kê và thị trường carbon.")

with tab4:
    st.markdown("#### 🤖 Cố Vấn Khoa Học Net Zero (AI Science Consultant)")
    st.caption("Trợ lý trí tuệ nhân tạo khai thác dữ liệu kiểm kê thực tế của doanh nghiệp để giải đáp các bài toán kinh tế tuần hoàn.")

    c_chat_main, c_chat_side = st.columns([7, 3], gap="large")

    with c_chat_side:
        st.markdown("##### 💡 Câu Hỏi Gợi Ý Nhanh")
        quick_prompts = [
            f"Đánh giá mức phát thải {format_vn(total_emissions_ton)} tCO2 và đề xuất 3 giải pháp giảm Scope 1 & 2",
            "Tại sao Blue Carbon Cần Giờ hấp thụ cao gấp 4-6 lần rừng trên cạn?",
            f"Với đơn giá ${carbon_price:.1f}/tCO2, doanh nghiệp nên phân bổ ngân sách ESG thế nào?",
            "Cơ chế Retirement bảo vệ chứng nhận chống Double Counting ra sao?"
        ]
        for idx, q_text in enumerate(quick_prompts):
            if st.button(f"👉 {q_text}", key=f"btn_quick_prompt_{idx}", use_container_width=True):
                st.session_state["chat_history"].append({"role": "user", "content": q_text})
                ans = generate_advisor_answer(q_text, company_name, total_emissions_ton, total_scope1_ton, total_scope2_ton, offset_cost_usd, carbon_price)
                st.session_state["chat_history"].append({"role": "assistant", "content": ans})
                st.rerun()

        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
        st.markdown(f"""
        <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; font-size: 12px;">
            <b style="color: #10b981;">HỒ SƠ ĐANG TƯ VẤN:</b><br>
            • <b>Đơn vị:</b> {company_name}<br>
            • <b>Phát thải:</b> {format_vn(total_emissions_ton)} tCO2e<br>
            • <b>Chi phí bù đắp:</b> {format_usd(offset_cost_usd)}
        </div>
        """, unsafe_allow_html=True)

    with c_chat_main:
        chat_box = st.container(height=420, border=True)
        with chat_box:
            for msg in st.session_state["chat_history"]:
                with st.chat_message(msg["role"]):
                    st.markdown(msg["content"])

        user_msg = st.chat_input("Nhập câu hỏi cần tư vấn...")
        if user_msg:
            st.session_state["chat_history"].append({"role": "user", "content": user_msg})
            ans = generate_advisor_answer(user_msg, company_name, total_emissions_ton, total_scope1_ton, total_scope2_ton, offset_cost_usd, carbon_price)
            st.session_state["chat_history"].append({"role": "assistant", "content": ans})
            st.rerun()

# ==============================================================================
# FOOTER CHÂN TRANG
# ==============================================================================
st.markdown("---")
st.markdown("""
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; color: #64748b; font-size: 11px; padding: 10px 0;">
    <div>
        <b>CarbonLens 2026</b> · Đề tài nghiên cứu Kinh tế tuần hoàn & Thị trường Tín chỉ Blue Carbon Rừng Ngập Mặn Cần Giờ
    </div>
    <div>
        Phương pháp luận: GHG Protocol & IPCC Wetlands · UNESCO Biosphere Reserve
    </div>
</div>
""", unsafe_allow_html=True)
