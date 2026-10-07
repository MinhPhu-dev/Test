import os
import re

code = '''# -*- coding: utf-8 -*-
"""
CarbonLens - Nền tảng phân tích phát thải doanh nghiệp và định giá tín chỉ carbon rừng ngập mặn Cần Giờ
Phiên bản Giao diện Cao cấp (Dark Luxury Emerald & Glassmorphism UI)
Phục vụ nghiên cứu khoa học Kinh tế tuần hoàn & Thị trường Tín chỉ Carbon.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# ==============================================================================
# 1. CẤU HÌNH TRANG STREAMLIT
# ==============================================================================
st.set_page_config(
    page_title="CarbonLens - Tín chỉ Carbon Rừng Cần Giờ",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==============================================================================
# 2. BỘ CSS DARK LUXURY EMERALD TOÀN DIỆN (ÉP NỀN TỐI & VIỀN KÍNH PHÁT SÁNG)
# ==============================================================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    /* Ép nền tối toàn trang */
    html, body, .stApp, [data-testid="stAppViewContainer"], [data-testid="stHeader"] {
        background: #020617 !important;
        background-color: #020617 !important;
        color: #f8fafc !important;
        font-family: 'Plus Jakarta Sans', sans-serif !important;
    }
    
    /* Ẩn header mặc định của Streamlit */
    header[data-testid="stHeader"] {
        background-color: rgba(2, 6, 23, 0.8) !important;
        backdrop-filter: blur(10px) !important;
    }

    /* Thanh điều hướng Sidebar */
    section[data-testid="stSidebar"] {
        background-color: #0b1329 !important;
        border-right: 1px solid rgba(16, 185, 129, 0.2) !important;
    }
    section[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p,
    section[data-testid="stSidebar"] label {
        color: #cbd5e1 !important;
        font-weight: 500 !important;
    }

    /* Các tiêu đề Heading */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Plus Jakarta Sans', sans-serif !important;
        font-weight: 700 !important;
        letter-spacing: -0.02em !important;
    }

    /* Thẻ Tabs (1, 2, 3, 4) - Đóng khung vuông bo góc */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px !important;
        background-color: rgba(15, 23, 42, 0.95) !important;
        padding: 8px !important;
        border-radius: 14px !important;
        border: 1px solid #1e293b !important;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 10px !important;
        padding: 10px 22px !important;
        font-weight: 600 !important;
        font-size: 0.92rem !important;
        color: #94a3b8 !important;
        border: 1px solid #334155 !important;
        background-color: #0f172a !important;
        transition: all 0.2s ease !important;
    }
    .stTabs [data-baseweb="tab"]:hover {
        color: #34d399 !important;
        border-color: #10b981 !important;
        background-color: rgba(16, 185, 129, 0.15) !important;
    }
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        color: #ffffff !important;
        border-color: #34d399 !important;
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4) !important;
    }

    /* Nút bấm (Buttons) */
    .stButton > button {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 10px 24px !important;
        font-weight: 600 !important;
        font-size: 0.95rem !important;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
        transition: all 0.2s ease !important;
    }
    .stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5) !important;
    }

    /* Khung nhập liệu (Inputs & Sliders) */
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
        background: linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 18px;
        padding: 26px 32px;
        margin-bottom: 24px;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(16, 185, 129, 0.15);
    }
    .badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(16, 185, 129, 0.2);
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        color: #34d399;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.05em;
    }

    /* Thẻ KPI Card Glassmorphism */
    .kpi-card {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 14px;
        padding: 18px 20px;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .kpi-card:hover {
        transform: translateY(-2px);
        border-color: rgba(16, 185, 129, 0.5);
    }
    .kpi-title {
        color: #94a3b8;
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
    }
    .kpi-value {
        color: #ffffff;
        font-size: 1.85rem;
        font-weight: 800;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: -0.02em;
    }

    /* Màn hình khóa phân quyền */
    .locked-card {
        background: #0f172a;
        border: 1px solid rgba(245, 158, 11, 0.4);
        border-radius: 20px;
        padding: 36px 30px;
        text-align: center;
        box-shadow: 0 15px 35px -10px rgba(0,0,0,0.7);
    }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 3. ĐỊNH NGHĨA DỮ LIỆU 4 NHÓM NGƯỜI DÙNG (USER ROLES CONFIG)
# ==============================================================================
ROLES_DATA = {
    "corporate": {
        "key": "corporate",
        "name": "Nguyễn Minh Tuấn",
        "org": "Tập đoàn Công nghệ & Sản xuất Á Châu",
        "title": "Giám đốc ESG & Phát triển bền vững",
        "role_name": "Nhóm 1: Doanh nghiệp phát thải (Corporate)",
        "short_title": "Doanh nghiệp phát thải",
        "badge_text": "Doanh nghiệp (Scope 1 & 2)",
        "badge_color": "#10b981",
        "badge_bg": "rgba(6, 78, 59, 0.4)",
        "badge_border": "rgba(16, 185, 129, 0.4)",
        "purpose": "Đối tượng khách hàng cốt lõi cần giải quyết bài toán kiểm kê và tuân thủ giảm phát thải.",
        "icon": "🏢",
        "features": [
            "Nhập liệu tiêu thụ năng lượng/nhiên liệu (Điện, Xăng, Dầu)",
            "Tự động tính toán Scope 1, Scope 2, Scope 3",
            "Xuất báo cáo ESG & LCA chuẩn GHG Protocol / IPCC",
            "MỞ KHÓA SÀN GIAO DỊCH: Mua tín chỉ bù đắp & Cấp Chứng nhận Net Zero"
        ]
    },
    "forest_authority": {
        "key": "forest_authority",
        "name": "TS. Lê Văn Thắng",
        "org": "Ban Quản Lý Khu Dự Trữ Sinh Quyển Cần Giờ",
        "title": "Trưởng phòng MRV & Đo đạc Viễn thám",
        "role_name": "Nhóm 2: Đơn vị quản lý / Chủ rừng Cần Giờ (Forest Authority)",
        "short_title": "BQL Rừng Cần Giờ",
        "badge_text": "Chủ rừng & BQL Cần Giờ",
        "badge_color": "#38bdf8",
        "badge_bg": "rgba(7, 89, 133, 0.4)",
        "badge_border": "rgba(56, 189, 248, 0.4)",
        "purpose": "Đại diện cho phía cung (Supply side) trên thị trường tín chỉ carbon.",
        "icon": "🌲",
        "features": [
            "Cập nhật dữ liệu sinh khối, diện tích 35.120 ha rừng Cần Giờ",
            "Cập nhật chỉ số hấp thụ carbon thực tế theo 4 phân khu",
            "Quản lý & PHÁT HÀNH các lô tín chỉ Blue Carbon mới (VCS / Plan Vivo)",
            "Theo dõi phân bổ 95% doanh thu Quỹ PES cho 1.000+ hộ dân giữ rừng"
        ]
    },
    "citizen": {
        "key": "citizen",
        "name": "Trần Hoàng Nam",
        "org": "Cộng đồng Tình nguyện viên Net Zero",
        "title": "Công dân tiên phong Lối sống xanh",
        "role_name": "Nhóm 3: Người tiêu dùng / Cá nhân (Citizen)",
        "short_title": "Cá nhân & Người tiêu dùng",
        "badge_text": "Cá nhân / Người tiêu dùng",
        "badge_color": "#fbbf24",
        "badge_bg": "rgba(120, 53, 15, 0.4)",
        "badge_border": "rgba(245, 158, 11, 0.4)",
        "purpose": "Giáo dục cộng đồng, nâng cao nhận thức xã hội (Public Awareness).",
        "icon": "👤",
        "features": [
            "Tra cứu dấu chân carbon cá nhân (Đi lại xe máy/ô tô, điện nhà, ăn uống)",
            "So sánh lượng phát thải cá nhân với mức trung bình VN (1.8 tCO2/năm)",
            "Chương trình cộng đồng: Góp cây giữ rừng Cần Giờ (25.000 VNĐ/cây Đước)",
            "🔒 KHÓA SÀN GIAO DỊCH B2B (Dành riêng cho doanh nghiệp kiểm kê)"
        ]
    },
    "admin": {
        "key": "admin",
        "name": "Phạm Quốc Hùng",
        "org": "Trung tâm Vận hành Quốc gia CarbonLens",
        "title": "Quản trị viên Hệ thống Cấp cao (Super Admin)",
        "role_name": "Nhóm 4: Quản trị viên hệ thống (Admin)",
        "short_title": "Quản trị viên Hệ thống",
        "badge_text": "Quản trị viên (Admin)",
        "badge_color": "#c084fc",
        "badge_bg": "rgba(88, 28, 135, 0.4)",
        "badge_border": "rgba(192, 132, 252, 0.4)",
        "purpose": "Toàn quyền kiểm duyệt, quản lý tài khoản, cấu hình tham số hệ thống.",
        "icon": "🛡️",
        "features": [
            "Quản lý tài khoản người dùng cả 4 nhóm (Phân quyền & Kiểm duyệt)",
            "Kiểm duyệt dữ liệu phát thải doanh nghiệp & dữ liệu sinh khối rừng",
            "Cấu hình hệ số phát thải quốc gia (Bộ TN&MT) & Giá sàn tín chỉ",
            "Toàn quyền truy cập tất cả các phân hệ và xuất báo cáo kiểm toán"
        ]
    }
}

# ==============================================================================
# 4. TẦNG GIAO DIỆN ĐĂNG NHẬP PHÂN QUYỀN (LOGIN GATEWAY LAYER)
# ==============================================================================
if "logged_in" not in st.session_state:
    st.session_state["logged_in"] = False
if "current_role" not in st.session_state:
    st.session_state["current_role"] = "corporate"

if not st.session_state.get("logged_in", False):
    st.markdown("""
    <div style="text-align: center; margin: 25px 0 35px 0;">
        <div class="badge-pill" style="font-size: 13px; padding: 6px 16px;">
            ✨ CỔNG ĐĂNG NHẬP PHÂN QUYỀN 4 NHÓM NGƯỜI DÙNG
        </div>
        <h1 style="color: #ffffff; font-size: 2.3rem; font-weight: 800; margin: 16px 0 10px 0; letter-spacing: -0.5px;">
            Chọn Vai Trò Để Bắt Đầu Trải Nghiệm Nền Tảng
        </h1>
        <p style="color: #94a3b8; font-size: 0.98rem; max-width: 820px; margin: 0 auto; line-height: 1.6;">
            Hệ thống tự động mở khóa các công cụ chuyên biệt tùy theo nhóm tài khoản bạn lựa chọn. 
            Bạn có thể chuyển đổi linh hoạt vai trò bất cứ lúc nào trên thanh điều hướng.
        </p>
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3, col4 = st.columns(4, gap="medium")
    roles_order = ["corporate", "forest_authority", "citizen", "admin"]
    cols = [col1, col2, col3, col4]

    for idx, r_key in enumerate(roles_order):
        r_info = ROLES_DATA[r_key]
        with cols[idx]:
            features_html = "".join([
                f"<div style='font-size: 11px; color: #cbd5e1; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;'><span style='color: #10b981; font-weight: bold;'>✓</span><span style='line-height: 1.3;'>{f}</span></div>"
                for f in r_info["features"][:3]
            ])
            if r_key == "citizen":
                features_html += "<div style='font-size: 11px; color: #fbbf24; margin-top: 4px; font-weight: 600;'><span style='margin-right: 4px;'>🔒</span>Khóa sàn mua tín chỉ carbon B2B</div>"
            
            st.markdown(f"""
            <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 20px 18px; min-height: 480px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
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
                        <div style="font-size: 9px; color: #64748b; font-family: monospace; text-transform: uppercase;">Tài khoản trải nghiệm mẫu:</div>
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
            if st.button(f"Đăng nhập vai trò này ➔", key=f"login_btn_{r_key}", use_container_width=True):
                st.session_state["logged_in"] = True
                st.session_state["current_role"] = r_key
                st.rerun()

    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #64748b; font-size: 12px; padding: 10px 0;">
        Hệ thống Kiểm kê Phát thải & Sàn Giao dịch Tín chỉ Blue Carbon Rừng Ngập Mặn Cần Giờ © 2026. Chuẩn GHG Protocol & IPCC.
    </div>
    """, unsafe_allow_html=True)
    st.stop()

# ==============================================================================
# 5. GIAO DIỆN CHÍNH SAU KHI ĐĂNG NHẬP & PHÂN QUYỀN
# ==============================================================================
current_role_key = st.session_state.get("current_role", "corporate")
curr_role = ROLES_DATA.get(current_role_key, ROLES_DATA["corporate"])

# Thanh Banner Trạng Thái Người Dùng & Nút Đổi Vai Trò
b_banner, b_actions = st.columns([75, 25])
with b_banner:
    st.markdown(f"""
    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: {curr_role['badge_bg']}; border: 1px solid {curr_role['badge_border']}; display: flex; align-items: center; justify-content: center; font-size: 16px;">
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

with b_actions:
    col_sw, col_lg = st.columns([6, 4])
    with col_sw:
        selected_sw = st.selectbox(
            "Chuyển vai trò:",
            options=["corporate", "forest_authority", "citizen", "admin"],
            index=["corporate", "forest_authority", "citizen", "admin"].index(current_role_key),
            format_func=lambda x: ROLES_DATA[x]["short_title"],
            label_visibility="collapsed"
        )
        if selected_sw != current_role_key:
            st.session_state["current_role"] = selected_sw
            st.rerun()
    with col_lg:
        if st.button("🚪 Đăng xuất", use_container_width=True):
            st.session_state["logged_in"] = False
            st.rerun()

# ==============================================================================
# 6. SIDEBAR: THAM SỐ ĐẦU VÀO VÀ CẤU HÌNH THỊ TRƯỜNG
# ==============================================================================
with st.sidebar:
    st.markdown("""
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="font-size: 28px;">🌿</span>
        <div>
            <div style="font-size: 19px; font-weight: 800; color: #10b981; letter-spacing: -0.5px;">CarbonLens</div>
            <div style="font-size: 11px; color: #94a3b8;">Cần Giờ Blue Carbon Platform</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("##### 👤 VAI TRÒ NGƯỜI DÙNG (USER ROLE)")
    sidebar_keys = ["corporate", "forest_authority", "citizen", "admin"]
    sb_role = st.radio(
        "Nhóm tài khoản đang dùng:",
        options=sidebar_keys,
        index=sidebar_keys.index(current_role_key),
        format_func=lambda x: ROLES_DATA[x]["role_name"],
        help="Mỗi nhóm người dùng sẽ mở khóa các tính năng chuyên biệt trên hệ thống."
    )
    if sb_role != current_role_key:
        st.session_state["current_role"] = sb_role
        st.rerun()
    
    st.markdown("---")
    st.markdown("##### ⚙️ THAM SỐ THỊ TRƯỜNG TÍN CHỈ")
    
    carbon_price = st.slider(
        "Giá tín chỉ carbon (USD/tCO2e):",
        min_value=5.0,
        max_value=60.0,
        value=15.0,
        step=0.5,
        help="Đơn giá tham chiếu theo thị trường tự nguyện (VCM) và các dự án Blue Carbon quốc tế."
    )
    
    usd_vnd_rate = st.number_input(
        "Tỷ giá tham chiếu (USD/VNĐ):",
        min_value=23000,
        max_value=30000,
        value=25400,
        step=100
    )
    
    st.markdown("---")
    st.markdown("##### 🧪 HỆ SỐ PHÁT THẢI (EMISSION FACTORS)")
    grid_ef = st.number_input(
        "Lưới điện QG (kg CO2/kWh):",
        value=0.7221,
        format="%.4f",
        help="Công bố chính thức của Cục Biến đổi khí hậu - Bộ Tài nguyên và Môi trường Việt Nam."
    )
    petrol_ef = st.number_input(
        "Xăng RON 95 (kg CO2/lít):",
        value=2.3100,
        format="%.4f",
        help="Hướng dẫn kiểm kê KNK Quốc gia của IPCC."
    )
    diesel_ef = st.number_input(
        "Dầu Diesel (kg CO2/lít):",
        value=2.6800,
        format="%.4f",
        help="Hệ số đốt nhiên liệu di động theo IPCC Mobile Combustion."
    )

# ==============================================================================
# 7. HERO BANNER: THƯƠNG HIỆU & GIỚI THIỆU ĐỀ TÀI
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
# 8. KHỞI TẠO CÁC PHÂN HỆ THEO VAI TRÒ (TABS)
# ==============================================================================
if current_role_key == "citizen":
    tab1, tab2, tab3, tab_cit, tab4 = st.tabs([
        "1. Tính toán & Quy đổi Phát thải",
        "2. Giám sát Bể chứa Carbon Cần Giờ",
        "3. Sàn Giao dịch (🔒 Khóa)",
        "🌱 Dấu Chân Cá Nhân & Góp Cây",
        "4. Cố vấn Khoa học AI (Hỏi Đáp)"
    ])
elif current_role_key == "forest_authority":
    tab1, tab2, tab_fa, tab3, tab4 = st.tabs([
        "1. Tính toán & Quy đổi Phát thải",
        "2. Giám sát Bể chứa Carbon Cần Giờ",
        "🌲 BQL Cần Giờ & Phát Hành Tín Chỉ",
        "3. Sàn Giao dịch & Chứng nhận Bù đắp",
        "4. Cố vấn Khoa học AI (Hỏi Đáp)"
    ])
elif current_role_key == "admin":
    tab1, tab2, tab3, tab4, tab_admin = st.tabs([
        "1. Tính toán & Quy đổi Phát thải",
        "2. Giám sát Bể chứa Carbon Cần Giờ",
        "3. Sàn Giao dịch & Chứng nhận Bù đắp",
        "4. Cố vấn Khoa học AI (Hỏi Đáp)",
        "🛡️ Quản Trị Hệ Thống (Admin)"
    ])
else:
    tab1, tab2, tab3, tab4 = st.tabs([
        "1. Tính toán & Quy đổi Phát thải",
        "2. Giám sát Bể chứa Carbon Cần Giờ",
        "3. Sàn Giao dịch & Chứng nhận Bù đắp",
        "4. Cố vấn Khoa học AI (Hỏi Đáp)"
    ])
'''

with open('/tmp/app_head.py', 'w') as f:
    f.write(code)
print("Wrote head successfully")
