# -*- coding: utf-8 -*-
"""
CarbonLens - Phân tích phát thải doanh nghiệp và định giá tín chỉ carbon rừng ngập mặn Cần Giờ.

Chạy:  streamlit run app.py
Yêu cầu: Streamlit >= 1.36. Đặt file .streamlit/config.toml cạnh app.py để có giao diện sáng đúng màu.
"""

import csv
import hashlib
import io
from datetime import datetime
from html import escape

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

st.set_page_config(
    page_title="CarbonLens - Tín chỉ Carbon Rừng Cần Giờ",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ==============================================================================
# 1. HẰNG SỐ & DỮ LIỆU GỐC
# ==============================================================================
GREEN, BLUE, AMBER, RED, GREY, PURPLE = "#1b6b4a", "#2f6f9f", "#c08a1e", "#b4442e", "#8a949e", "#6b5b95"
GRID = "#e3e7ea"

SEQ_RATE = 18.5            # tCO2e/ha/năm
BIOSPHERE_HA = 75740       # tổng diện tích Khu dự trữ sinh quyển
EV_KWH_PER_LITER = 1.7     # kWh điện thay cho 1 lít xăng/dầu khi điện hóa đội xe
ELEC_PRICE_VND = 2050.0
FUEL_PRICE_VND = 23500.0
TREE_KG_CO2 = 25
TREE_PRICE_VND = 25000
VN_AVG_FOOTPRINT = 1.8
HOUSEHOLDS = 1000

ROLE_KEYS = ["corporate", "forest_authority", "citizen", "admin"]
INDUSTRIES = ["Sản xuất chế biến", "Logistics & Vận tải", "Thương mại & Dịch vụ", "Bất động sản & Xây dựng"]
SCALES = ["Doanh nghiệp lớn (>500 nhân sự)", "Doanh nghiệp vừa (100 - 500)", "Doanh nghiệp nhỏ (<100)"]

# Tham số hệ thống: Admin cấu hình, các phân hệ khác chỉ đọc
SYSTEM_DEFAULTS = dict(
    carbon_price=15.0, usd_vnd_rate=25400,
    grid_ef=0.7221, petrol_ef=2.31, diesel_ef=2.68,
    pes_share=95, floor_price=14.0,
)
# Dữ liệu kiểm kê của doanh nghiệp (giữ lại khi chuyển tab / vai trò)
CORP_DEFAULTS = dict(
    c_company="Tập đoàn Công nghệ & Sản xuất Á Châu", c_industry=INDUSTRIES[0], c_scale=SCALES[0],
    c_kwh=350000.0, c_petrol=18000.0, c_diesel=25000.0,
)

POOLS = [
    ("Trầm tích hữu cơ (Soil Blue Carbon)", 62.5),
    ("Sinh khối trên mặt đất (AGB)", 23.0),
    ("Sinh khối dưới mặt đất (BGB - rễ)", 11.5),
    ("Vật rơi rụng & thảm mục (Litter)", 3.0),
]

ROLES_DATA = {
    "corporate": {
        "name": "Nguyễn Minh Tuấn", "org": "Tập đoàn Công nghệ & Sản xuất Á Châu",
        "title": "Giám đốc ESG & Phát triển bền vững", "short_title": "Doanh nghiệp phát thải",
        "purpose": "Kiểm kê phát thải và mua tín chỉ để bù đắp.",
        "features": [
            ("ok", "Nhập điện, xăng, dầu tiêu thụ và tính Scope 1, Scope 2"),
            ("ok", "Mô phỏng kịch bản giảm phát thải"),
            ("ok", "Xuất báo cáo ESG theo GHG Protocol / ISO 14064"),
            ("unlock", "Mua tín chỉ trên sàn và nhận chứng nhận bù đắp"),
        ],
    },
    "forest_authority": {
        "name": "TS. Lê Văn Thắng", "org": "Ban Quản Lý Khu Dự Trữ Sinh Quyển Cần Giờ",
        "title": "Trưởng phòng MRV & Đo đạc Viễn thám", "short_title": "BQL Rừng Cần Giờ",
        "purpose": "Bên cung cấp tín chỉ: quản lý rừng và phát hành tín chỉ.",
        "features": [
            ("ok", "Cập nhật mật độ trữ lượng carbon của 4 phân khu"),
            ("ok", "Phát hành lô tín chỉ Blue Carbon mới (VCS / Plan Vivo)"),
            ("ok", "Theo dõi sổ cái các lô đã phát hành"),
            ("ok", "Theo dõi Quỹ PES chi trả cho hộ dân giữ rừng"),
        ],
    },
    "citizen": {
        "name": "Trần Hoàng Nam", "org": "Cộng đồng Tình nguyện viên Net Zero",
        "title": "Công dân tiên phong Lối sống xanh", "short_title": "Cá nhân & Người tiêu dùng",
        "purpose": "Tính dấu chân carbon cá nhân và góp cây giữ rừng.",
        "features": [
            ("ok", "Tính dấu chân carbon từ đi lại, điện nhà, ăn uống"),
            ("ok", "So sánh với mức trung bình của người Việt (1,8 tCO2/năm)"),
            ("ok", "Góp cây Đước giữ rừng Cần Giờ (25.000 VNĐ/cây)"),
            ("lock", "Sàn giao dịch B2B chỉ dành cho doanh nghiệp"),
        ],
    },
    "admin": {
        "name": "Phạm Quốc Hùng", "org": "Trung tâm Vận hành Quốc gia CarbonLens",
        "title": "Quản trị viên Hệ thống Cấp cao", "short_title": "Quản trị viên hệ thống",
        "purpose": "Quản lý tài khoản, tham số hệ thống và đối soát giao dịch.",
        "features": [
            ("ok", "Xem danh sách người dùng của cả 4 nhóm"),
            ("ok", "Cấu hình hệ số phát thải, giá sàn tín chỉ, tỷ lệ Quỹ PES"),
            ("ok", "Đối soát sổ cái giao dịch"),
            ("ok", "Truy cập tất cả các phân hệ"),
        ],
    },
}

# ==============================================================================
# 2. TRẠNG THÁI PHIÊN
# ==============================================================================
st.session_state.setdefault("logged_in", False)
st.session_state.setdefault("role", "corporate")
st.session_state.setdefault("ledger", [])
st.session_state.setdefault("last_cert", None)
st.session_state.setdefault("batches", [
    {"Mã lô": "BC-001", "Tên đợt": "Đợt 1 - Phân khu lõi nghiêm ngặt", "Tiêu chuẩn": "Verra VCS (VM0033)",
     "Khối lượng (tCO2e)": 120000.0, "Giá sàn ($/tCO2e)": 14.0, "Ngày": "15/01/2026"},
    {"Mã lô": "BC-002", "Tên đợt": "Đợt 2 - Hành lang sông Lòng Tàu", "Tiêu chuẩn": "Plan Vivo Blue Carbon Standard",
     "Khối lượng (tCO2e)": 80000.0, "Giá sàn ($/tCO2e)": 15.0, "Ngày": "20/05/2026"},
])
st.session_state.setdefault("zones", pd.DataFrame({
    "Phân khu bảo tồn": ["Phân khu Vùng lõi nghiêm ngặt", "Phân khu Phục hồi sinh thái",
                         "Phân khu Vùng đệm phát triển", "Hành lang sông Lòng Tàu & Soài Rạp"],
    "Diện tích (ha)": [4721, 15600, 9260, 5539],
    "Loài cây ưu thế": ["Đước đôi, Dà quánh, Vẹt dù", "Đước đôi tái sinh, Cóc đỏ, Bần trắng",
                        "Mấm trắng, Bần chua, Dừa nước", "Thảm ngập triều hỗn giao bãi bồi"],
    "Mật độ trữ lượng (tCO2/ha)": [650.0, 548.0, 435.0, 398.0],
}))
st.session_state.setdefault("chat_history", [{
    "role": "assistant",
    "content": "Xin chào! Tôi là trợ lý Net Zero của CarbonLens. Tôi có thể giúp bạn đọc kết quả kiểm kê, "
               "gợi ý cách giảm Scope 1 - 2 và giải thích cơ chế Blue Carbon Cần Giờ. Bạn muốn hỏi gì?",
}])

# Áp dụng tham số Admin vừa lưu (phải làm trước khi tạo widget có key tương ứng)
_pending = st.session_state.pop("pending_params", None)
if _pending:
    st.session_state.update(_pending)

# Giữ giá trị khi widget không được vẽ (ví dụ đang ở trang đăng nhập hoặc đổi vai trò)
for _k, _v in {**SYSTEM_DEFAULTS, **CORP_DEFAULTS}.items():
    st.session_state[_k] = st.session_state.get(_k, _v)
st.session_state["carbon_price"] = max(float(st.session_state["carbon_price"]), float(st.session_state["floor_price"]))


# ==============================================================================
# 3. HÀM TIỆN ÍCH
# ==============================================================================
def md(s: str) -> None:
    """Gộp HTML thành một dòng để Markdown không hiểu nhầm thụt lề là code block."""
    st.markdown(" ".join(line.strip() for line in s.strip().splitlines() if line.strip()), unsafe_allow_html=True)


def vn(x: float, d: int = 1) -> str:
    """Số kiểu Việt Nam: 1.234.567,8"""
    return f"{x:,.{d}f}".replace(",", "§").replace(".", ",").replace("§", ".")


def usd(x: float, d: int = 0) -> str:
    return "$" + vn(x, d)


def short_hash(text: str, mod: int = 9000, offset: int = 1000) -> int:
    return int(hashlib.md5(text.encode("utf-8")).hexdigest(), 16) % mod + offset


def style_fig(fig, height=300):
    fig.update_layout(
        height=height, template="plotly_white", separators=",.",
        margin=dict(t=20, b=20, l=10, r=10),
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Be Vietnam Pro, sans-serif", color="#3c4650"),
        legend=dict(orientation="h", y=-0.2, x=0, title=None),
    )
    fig.update_xaxes(gridcolor=GRID, zeroline=False)
    fig.update_yaxes(gridcolor=GRID, zeroline=False)
    return fig


# ==============================================================================
# 4. CSS (GỌN: CHỈ CHỈNH FONT, MÀU, TAB, NÚT)
# ==============================================================================
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

html, body, .stApp, button, input, textarea, [data-testid="stMarkdownContainer"]{
  font-family:'Be Vietnam Pro', system-ui, sans-serif;
}
.stApp{background:#f6f7f8; color:#1f2933;}
[data-testid="stHeader"]{background:transparent;}
#MainMenu, footer{visibility:hidden;}
.block-container{max-width:1180px; padding-top:1.6rem; padding-bottom:3rem;}
section[data-testid="stSidebar"]{border-right:1px solid #dde1e5;}

h1,h2,h3,h4,h5{color:#16232d; font-weight:600 !important; letter-spacing:0 !important;}
h3{font-size:1.3rem !important;}
h4{font-size:1.1rem !important;}
h5{font-size:1rem !important;}
hr{margin:1.4rem 0 !important; border-color:#dde1e5 !important;}

[data-testid="stMetricLabel"] p{color:#5f6b76; font-size:.85rem;}
[data-testid="stMetricValue"]{font-size:1.55rem; font-weight:600; font-variant-numeric:tabular-nums;}
[data-testid="stVerticalBlockBorderWrapper"]{border-radius:8px;}

.stTabs [data-baseweb="tab-list"]{gap:2px; border-bottom:1px solid #dde1e5;}
.stTabs [data-baseweb="tab"]{height:44px; padding:0 14px; font-weight:500; color:#5f6b76;}
.stTabs [aria-selected="true"]{color:#1b6b4a; font-weight:600;}
.stTabs [data-baseweb="tab-panel"]{padding-top:1.2rem;}

.stButton > button, .stDownloadButton > button, [data-testid="stFormSubmitButton"] > button{
  border-radius:6px; font-weight:500; background:#fff; color:#1f2933; border:1px solid #c5ccd2;
}
.stButton > button:hover, .stDownloadButton > button:hover, [data-testid="stFormSubmitButton"] > button:hover{
  border-color:#1b6b4a; color:#1b6b4a;
}
button[kind="primary"], button[data-testid="stBaseButton-primary"]{
  background:#1b6b4a !important; color:#fff !important; border:1px solid #1b6b4a !important;
}
button[kind="primary"]:hover, button[data-testid="stBaseButton-primary"]:hover{background:#155a3d !important;}
.stButton button p, .stDownloadButton button p{color:inherit !important;}

.login-title{text-align:center; margin:1.5rem 0 1.8rem 0;}
.login-title h1{font-size:2rem; margin:0 0 .4rem 0;}
.login-title p{color:#5f6b76; margin:0;}
.role-card{background:#fff; border:1px solid #dde1e5; border-radius:8px; padding:18px; min-height:400px;}
.role-card h4{margin:0 0 4px 0;}
.role-card .sub{color:#5f6b76; font-size:.88rem; margin-bottom:14px; min-height:42px;}
.role-card .user{background:#f3f5f6; border-radius:6px; padding:10px 12px; font-size:.85rem; line-height:1.5; margin-bottom:14px; min-height:82px;}
.role-card ul{padding-left:18px; margin:0; font-size:.88rem; line-height:1.5;}
.role-card li{margin-bottom:6px;}

.cert{background:#fff; border:3px double #1b6b4a; border-radius:4px; padding:26px 24px; text-align:center;}
.cert.empty{border:1px dashed #c5ccd2; color:#5f6b76; padding:48px 24px;}
.cert .t{font-size:1.2rem; font-weight:700; color:#1b6b4a;}
.cert .s{color:#5f6b76; font-size:.85rem; margin:2px 0 16px 0;}
.cert .org{font-size:1.25rem; font-weight:600; margin:2px 0 14px 0;}
.cert .n{font-size:2rem; font-weight:700; color:#1b6b4a; font-variant-numeric:tabular-nums;}
.cert .meta{text-align:left; font-size:.82rem; color:#4a5560; line-height:1.7; border-top:1px solid #e3e7ea; margin-top:16px; padding-top:12px;}
.report-box{background:#fff; border:1px solid #dde1e5; border-radius:6px; padding:16px 18px; font-size:.88rem; line-height:1.7;}
</style>
""", unsafe_allow_html=True)


# ==============================================================================
# 5. ĐĂNG NHẬP (CHỌN VAI TRÒ)
# ==============================================================================
def role_card(r: dict) -> str:
    prefix = {"ok": "", "unlock": "<b>Mở khóa:</b> ", "lock": "<b>Bị khóa:</b> "}
    feats = "".join(f"<li>{prefix[k]}{t}</li>" for k, t in r["features"])
    return f"""
    <div class="role-card">
      <h4>{r['short_title']}</h4>
      <div class="sub">{r['purpose']}</div>
      <div class="user"><b>{r['name']}</b><br>{r['title']}<br>{r['org']}</div>
      <ul>{feats}</ul>
    </div>"""


if not st.session_state["logged_in"]:
    md('<style>[data-testid="stSidebar"], [data-testid="stSidebarCollapsedControl"]{display:none !important;}</style>')
    md("""
    <div class="login-title">
      <h1>CarbonLens</h1>
      <p>Chọn một vai trò để dùng thử. Bạn có thể đổi vai trò bất cứ lúc nào ở thanh bên trái.</p>
    </div>
    """)
    login_cols = st.columns(4, gap="medium")
    for col, key in zip(login_cols, ROLE_KEYS):
        with col:
            md(role_card(ROLES_DATA[key]))
            if st.button("Đăng nhập", key=f"login_{key}", type="primary", use_container_width=True):
                st.session_state["logged_in"] = True
                st.session_state["role"] = key
                st.rerun()
    st.divider()
    st.caption("Hệ thống kiểm kê phát thải và sàn giao dịch tín chỉ Blue Carbon rừng ngập mặn Cần Giờ. Dữ liệu trong bản này là mô phỏng.")
    st.stop()

# ==============================================================================
# 6. KHUNG ỨNG DỤNG: ĐẦU TRANG, THANH BÊN
# ==============================================================================
role_key = st.session_state["role"] if st.session_state["role"] in ROLES_DATA else "corporate"
role = ROLES_DATA[role_key]
st.session_state["role_radio"] = role_key  # đồng bộ radio với vai trò hiện tại


def _on_role_change():
    st.session_state["role"] = st.session_state["role_radio"]


head_l, head_r = st.columns([6, 1], vertical_alignment="center")
with head_l:
    st.markdown("### CarbonLens")
    st.caption(f"{role['name']} · {role['title']} · {role['org']}")
with head_r:
    if st.button("Đăng xuất", use_container_width=True):
        st.session_state["logged_in"] = False
        st.rerun()

with st.sidebar:
    st.markdown("### CarbonLens")
    st.caption("Tín chỉ Blue Carbon rừng Cần Giờ")
    st.radio("Vai trò đang dùng (bản demo):", ROLE_KEYS, key="role_radio", on_change=_on_role_change,
             format_func=lambda k: ROLES_DATA[k]["short_title"])
    st.divider()

    if role_key in ("corporate", "admin"):
        st.slider("Giá tín chỉ (USD/tCO2e):", min_value=float(st.session_state["floor_price"]), max_value=60.0,
                  step=0.5, key="carbon_price",
                  help="Giá tham chiếu thị trường tự nguyện. Không thấp hơn giá sàn do Admin quy định.")
    st.number_input("Tỷ giá (VNĐ/USD):", min_value=23000, max_value=30000, step=100, key="usd_vnd_rate")

    if role_key in ("corporate", "citizen", "admin"):
        with st.expander("Hệ số phát thải"):
            st.caption("Do Bộ TN&MT công bố. Chỉ Quản trị viên được chỉnh.")
            st.number_input("Lưới điện (kg CO2/kWh):", format="%.4f", key="grid_ef", disabled=True)
            st.number_input("Xăng RON 95 (kg CO2/lít):", format="%.4f", key="petrol_ef", disabled=True)
            st.number_input("Dầu Diesel (kg CO2/lít):", format="%.4f", key="diesel_ef", disabled=True)

carbon_price = float(st.session_state["carbon_price"])
usd_vnd_rate = int(st.session_state["usd_vnd_rate"])
grid_ef = float(st.session_state["grid_ef"])
petrol_ef = float(st.session_state["petrol_ef"])
diesel_ef = float(st.session_state["diesel_ef"])
pes_share = int(st.session_state["pes_share"])
floor_price = float(st.session_state["floor_price"])

# ==============================================================================
# 7. SỐ LIỆU DÙNG CHUNG (TÍNH MỘT LẦN, MỌI TRANG CÙNG ĐỌC)
# ==============================================================================
zones = st.session_state["zones"]
forest_ha = float(zones["Diện tích (ha)"].sum())
stock_mt = float((zones["Diện tích (ha)"] * zones["Mật độ trữ lượng (tCO2/ha)"]).sum() / 1e6)
annual_seq = forest_ha * SEQ_RATE

company_name = (st.session_state["c_company"] or "").strip() or "Doanh nghiệp chưa đặt tên"
industry, scale = st.session_state["c_industry"], st.session_state["c_scale"]
electricity_kwh = float(st.session_state["c_kwh"])
petrol_liters = float(st.session_state["c_petrol"])
diesel_liters = float(st.session_state["c_diesel"])

scope1_petrol_ton = petrol_liters * petrol_ef / 1000.0
scope1_diesel_ton = diesel_liters * diesel_ef / 1000.0
total_scope1_ton = scope1_petrol_ton + scope1_diesel_ton
total_scope2_ton = electricity_kwh * grid_ef / 1000.0
total_emissions_ton = total_scope1_ton + total_scope2_ton
offset_cost_usd = total_emissions_ton * carbon_price
offset_cost_vnd = offset_cost_usd * usd_vnd_rate


def pct_of_total(x: float) -> float:
    return (x / total_emissions_ton * 100.0) if total_emissions_ton > 0 else 0.0


def available_credits():
    supply = sum(b["Khối lượng (tCO2e)"] for b in st.session_state["batches"])
    retired = sum(t["tons"] for t in st.session_state["ledger"] if t["kind"] == "Doanh nghiệp")
    return supply, max(0.0, supply - retired)


# ==============================================================================
# 8. CÁC TRANG
# ==============================================================================
def page_inventory():
    st.subheader("Kiểm kê phát thải")
    st.caption("Nhập mức tiêu thụ năng lượng trong năm, hệ thống quy đổi ra tCO2e và ước tính chi phí bù đắp.")
    left, right = st.columns([2, 3], gap="large")

    with left:
        with st.container(border=True):
            st.markdown("**Thông tin doanh nghiệp**")
            st.text_input("Tên tổ chức:", key="c_company")
            a, b = st.columns(2)
            a.selectbox("Ngành nghề:", INDUSTRIES, key="c_industry")
            b.selectbox("Quy mô:", SCALES, key="c_scale")
        with st.container(border=True):
            st.markdown("**Điện năng (Scope 2)**")
            st.number_input("Điện tiêu thụ mỗi năm (kWh):", min_value=0.0, step=10000.0, format="%.0f", key="c_kwh")
            st.markdown("**Nhiên liệu vận tải (Scope 1)**")
            c, d = st.columns(2)
            c.number_input("Xăng (lít/năm):", min_value=0.0, step=1000.0, format="%.0f", key="c_petrol")
            d.number_input("Dầu Diesel (lít/năm):", min_value=0.0, step=1000.0, format="%.0f", key="c_diesel")

    with right:
        with st.container(border=True):
            m1, m2, m3 = st.columns(3)
            m1.metric("Scope 1 (nhiên liệu)", f"{vn(total_scope1_ton)} t")
            m2.metric("Scope 2 (điện lưới)", f"{vn(total_scope2_ton)} t")
            m3.metric("Tổng phát thải", f"{vn(total_emissions_ton)} tCO2e/năm")
        with st.container(border=True):
            n1, n2 = st.columns(2)
            n1.metric("Chi phí bù đắp ước tính", usd(offset_cost_usd, 2), help=f"Tổng phát thải × giá {usd(carbon_price, 1)}/tCO2e")
            n2.metric("Quy đổi VNĐ", f"{vn(offset_cost_vnd, 0)} đ", help=f"Tỷ giá {vn(usd_vnd_rate, 0)} VNĐ/USD")
        if total_emissions_ton > 0:
            fig = go.Figure(go.Pie(
                labels=["Scope 1 - Xăng", "Scope 1 - Diesel", "Scope 2 - Điện lưới"],
                values=[scope1_petrol_ton, scope1_diesel_ton, total_scope2_ton], hole=0.55,
                marker=dict(colors=[AMBER, RED, BLUE], line=dict(color="#f6f7f8", width=2)),
                textinfo="percent", sort=False))
            style_fig(fig, 260)
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Nhập dữ liệu tiêu thụ để xem cơ cấu phát thải.")

    st.divider()
    st.markdown("#### Chi phí bù đắp theo giá carbon")
    prices = list(range(5, 65, 5))
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=prices, y=[total_emissions_ton * p for p in prices], mode="lines+markers",
                             name="Theo kịch bản giá", line=dict(color=GREEN, width=2.5), marker=dict(size=7)))
    fig.add_trace(go.Scatter(x=[carbon_price], y=[offset_cost_usd], mode="markers", name="Giá đang chọn",
                             marker=dict(size=13, color=AMBER, line=dict(color="#fff", width=2))))
    style_fig(fig, 280)
    fig.update_layout(xaxis_title="Giá tín chỉ ($/tCO2e)", yaxis_title="Chi phí (USD)")
    st.plotly_chart(fig, use_container_width=True)

    # ---------- Mô phỏng giảm phát thải ----------
    st.divider()
    st.markdown("#### Mô phỏng giảm phát thải")
    st.caption("Kéo các thanh trượt để xem phát thải và chi phí tín chỉ thay đổi thế nào.")
    ctrl, res = st.columns([2, 3], gap="large")
    with ctrl:
        with st.container(border=True):
            sim_solar = st.slider("Điện mặt trời mái nhà (%)", 0, 100, 35, 5,
                                  help="Tỷ lệ điện tự sản tự tiêu thay điện lưới.")
            sim_logistics = st.slider("Tối ưu tuyến đường, logistics (%)", 0, 50, 20, 5,
                                      help="Giảm xăng dầu tiêu hao nhờ phân tuyến và gộp đơn.")
            sim_ev = st.slider("Điện hóa đội xe (%)", 0, 100, 25, 5,
                               help="Tỷ lệ nhiên liệu còn lại được thay bằng xe điện. Điện tăng thêm được tính vào Scope 2.")
            sim_eff = st.slider("Tiết kiệm điện, IoT (%)", 0, 30, 15, 5,
                                help="Biến tần, đèn LED, hệ thống quản lý năng lượng.")

    # Thứ tự: tối ưu logistics -> điện hóa phần còn lại -> điện cho xe EV cộng vào nhu cầu điện -> điện mặt trời
    keep_after_logistics = 1.0 - sim_logistics / 100.0
    sim_petrol = petrol_liters * keep_after_logistics * (1.0 - sim_ev / 100.0)
    sim_diesel = diesel_liters * keep_after_logistics * (1.0 - sim_ev / 100.0)
    ev_extra_kwh = (petrol_liters + diesel_liters) * keep_after_logistics * (sim_ev / 100.0) * EV_KWH_PER_LITER
    sim_grid_kwh = (electricity_kwh * (1.0 - sim_eff / 100.0) + ev_extra_kwh) * (1.0 - sim_solar / 100.0)
    sim_scope2 = sim_grid_kwh * grid_ef / 1000.0
    sim_scope1 = (sim_petrol * petrol_ef + sim_diesel * diesel_ef) / 1000.0
    sim_total = sim_scope1 + sim_scope2

    abated = max(0.0, total_emissions_ton - sim_total)
    saved_usd = max(0.0, offset_cost_usd - sim_total * carbon_price)
    saved_kwh = max(0.0, electricity_kwh - sim_grid_kwh)
    saved_liters = max(0.0, (petrol_liters + diesel_liters) - (sim_petrol + sim_diesel))
    opex_saved_vnd = saved_kwh * ELEC_PRICE_VND + saved_liters * FUEL_PRICE_VND

    with res:
        with st.container(border=True):
            r1, r2, r3 = st.columns(3)
            r1.metric("Phát thải sau can thiệp", f"{vn(sim_total)} t",
                      delta=f"-{vn(abated)} t ({vn(pct_of_total(abated))}%)", delta_color="inverse")
            r2.metric("Tiết kiệm tiền tín chỉ", usd(saved_usd), help="So với mua đủ tín chỉ cho phát thải hiện tại")
            r3.metric("Tiết kiệm điện, xăng dầu", f"{vn(opex_saved_vnd / 1e6)} tr đ/năm")
        df = pd.DataFrame({
            "Kịch bản": ["Hiện tại"] * 2 + ["Sau can thiệp"] * 2,
            "Nguồn": ["Scope 1 (nhiên liệu)", "Scope 2 (điện lưới)"] * 2,
            "tCO2e": [total_scope1_ton, total_scope2_ton, sim_scope1, sim_scope2],
        })
        fig = px.bar(df, x="Kịch bản", y="tCO2e", color="Nguồn", barmode="stack", text_auto=".1f",
                     color_discrete_map={"Scope 1 (nhiên liệu)": AMBER, "Scope 2 (điện lưới)": BLUE})
        style_fig(fig, 250)
        st.plotly_chart(fig, use_container_width=True)
        if ev_extra_kwh > 0:
            st.caption(f"Điện hóa đội xe làm tăng khoảng {vn(ev_extra_kwh, 0)} kWh/năm, đã tính vào Scope 2.")

    # ---------- Báo cáo ----------
    st.divider()
    st.markdown("#### Báo cáo kiểm kê")
    report_code = f"GHG-{datetime.now().year}-{short_hash(company_name):04d}"
    now_txt = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["BÁO CÁO KIỂM KÊ KHÍ NHÀ KÍNH (ISO 14064-1:2018)"])
    w.writerow(["Mã báo cáo", report_code])
    w.writerow(["Thời điểm lập", now_txt])
    w.writerow(["Tổ chức", company_name])
    w.writerow(["Ngành nghề", industry])
    w.writerow(["Quy mô", scale])
    w.writerow([])
    w.writerow(["Danh mục", "Lượng tiêu thụ", "Đơn vị", "Hệ số phát thải", "Đơn vị hệ số", "Phát thải (tCO2e)", "Tỷ trọng (%)"])
    w.writerow(["Scope 1 - Xăng RON 95", f"{petrol_liters:.0f}", "lít", f"{petrol_ef:.4f}", "kg CO2/lít (IPCC)",
                f"{scope1_petrol_ton:.2f}", f"{pct_of_total(scope1_petrol_ton):.1f}"])
    w.writerow(["Scope 1 - Dầu Diesel", f"{diesel_liters:.0f}", "lít", f"{diesel_ef:.4f}", "kg CO2/lít (IPCC)",
                f"{scope1_diesel_ton:.2f}", f"{pct_of_total(scope1_diesel_ton):.1f}"])
    w.writerow(["Scope 2 - Điện lưới", f"{electricity_kwh:.0f}", "kWh", f"{grid_ef:.4f}", "kg CO2/kWh (Bộ TN&MT)",
                f"{total_scope2_ton:.2f}", f"{pct_of_total(total_scope2_ton):.1f}"])
    w.writerow([])
    w.writerow(["Tổng phát thải (tCO2e)", f"{total_emissions_ton:.2f}"])
    w.writerow(["Giá tín chỉ tham chiếu (USD/tCO2e)", f"{carbon_price:.2f}"])
    w.writerow(["Chi phí bù đắp (USD)", f"{offset_cost_usd:.2f}"])
    w.writerow(["Chi phí bù đắp (VNĐ)", f"{offset_cost_vnd:.0f}"])

    with st.expander("Xem trước báo cáo"):
        md(f"""
        <div class="report-box">
          <b>Báo cáo kiểm kê khí nhà kính</b> · Mã {report_code} · Kỳ {datetime.now().year}<br>
          Tổ chức: {escape(company_name)}<br><br>
          <b>Scope 1</b><br>
          Xăng: {vn(petrol_liters, 0)} lít × {petrol_ef:.4f} = {vn(scope1_petrol_ton, 2)} tCO2e<br>
          Diesel: {vn(diesel_liters, 0)} lít × {diesel_ef:.4f} = {vn(scope1_diesel_ton, 2)} tCO2e<br>
          Tổng Scope 1: <b>{vn(total_scope1_ton, 2)} tCO2e</b><br><br>
          <b>Scope 2</b><br>
          Điện lưới: {vn(electricity_kwh, 0)} kWh × {grid_ef:.4f} = <b>{vn(total_scope2_ton, 2)} tCO2e</b><br><br>
          <b>Tổng phát thải: {vn(total_emissions_ton, 2)} tCO2e</b><br>
          Chi phí bù đắp: {usd(offset_cost_usd, 2)} (~{vn(offset_cost_vnd, 0)} đ)
        </div>
        """)
    st.download_button("Tải báo cáo (CSV)", data=buf.getvalue().encode("utf-8-sig"),
                       file_name=f"Bao_Cao_Kiem_Ke_{report_code}.csv", mime="text/csv", type="primary")


def page_forest():
    st.subheader("Rừng ngập mặn Cần Giờ")
    st.caption("Khu Dự trữ Sinh quyển Thế giới UNESCO công nhận năm 2000. Số liệu lấy từ bảng phân khu do BQL rừng cập nhật.")

    with st.container(border=True):
        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Diện tích rừng phòng hộ", f"{vn(forest_ha, 0)} ha", help=f"Trên tổng {vn(BIOSPHERE_HA, 0)} ha của Khu dự trữ sinh quyển")
        k2.metric("Tỷ suất hấp thụ", f"{vn(SEQ_RATE)} t/ha/năm")
        k3.metric("Hấp thụ mỗi năm", f"~{vn(round(annual_seq, -3), 0)} t")
        k4.metric("Trữ lượng tích lũy", f"{vn(stock_mt, 2)} triệu t")

    st.write("")
    c1, c2 = st.columns(2, gap="large")
    with c1:
        st.markdown("##### Bốn bể chứa carbon")
        pools = pd.DataFrame(POOLS, columns=["Bể carbon", "Tỷ lệ (%)"])
        pools["Trữ lượng (triệu tCO2)"] = pools["Tỷ lệ (%)"] / 100 * stock_mt
        pools["Nhãn"] = pools["Tỷ lệ (%)"].map(lambda v: f"{vn(v)}%")
        fig = px.bar(pools, x="Tỷ lệ (%)", y="Bể carbon", orientation="h", text="Nhãn",
                     hover_data={"Trữ lượng (triệu tCO2)": ":.2f", "Nhãn": False})
        fig.update_traces(marker_color=GREEN, textposition="outside")
        style_fig(fig, 300)
        fig.update_layout(yaxis=dict(categoryorder="total ascending", title=None), xaxis=dict(range=[0, 75]))
        st.plotly_chart(fig, use_container_width=True)
        st.caption(f"{vn(POOLS[0][1])}% carbon nằm trong trầm tích ngập triều thiếu oxy, giữ được hàng trăm năm nếu rừng được bảo tồn.")
    with c2:
        st.markdown("##### Dự báo hấp thụ carbon 2026 - 2035")
        years = list(range(2026, 2036))
        scenarios = {
            "Hiện trạng": [annual_seq + i * 8500 for i in range(10)],
            "Trồng mới & phục hồi": [annual_seq + i * 24000 + (i ** 1.2) * 3500 for i in range(10)],
            "Rủi ro khí hậu & xói lở": [annual_seq + i * 2000 - (i ** 1.4) * 2200 for i in range(10)],
        }
        fdf = pd.DataFrame([{"Năm": y, "tCO2/năm": v, "Kịch bản": n} for n, vals in scenarios.items() for y, v in zip(years, vals)])
        fig = px.line(fdf, x="Năm", y="tCO2/năm", color="Kịch bản", markers=True, color_discrete_sequence=[BLUE, GREEN, RED])
        style_fig(fig, 300)
        st.plotly_chart(fig, use_container_width=True)

    st.markdown("##### Các phân khu")
    zv = zones.copy()
    zv["Trữ lượng (triệu tCO2)"] = (zones["Diện tích (ha)"] * zones["Mật độ trữ lượng (tCO2/ha)"] / 1e6).map(lambda v: vn(v, 2))
    zv["Diện tích (ha)"] = zones["Diện tích (ha)"].map(lambda v: vn(v, 0))
    zv["Mật độ trữ lượng (tCO2/ha)"] = zones["Mật độ trữ lượng (tCO2/ha)"].map(lambda v: vn(v, 1))
    st.dataframe(zv, use_container_width=True, hide_index=True)

    st.divider()
    st.markdown("#### Vòng tuần hoàn tiền và sinh khối")
    mode = st.radio("Xem quy trình:", ["Dòng tiền từ tín chỉ", "Thu hồi sinh khối (Biochar)"], horizontal=True, label_visibility="collapsed")
    if mode.startswith("Dòng tiền"):
        steps = [
            ("Doanh nghiệp mua", "Ký hợp đồng bù đắp Scope 1-2 dựa trên dữ liệu kiểm kê."),
            ("Quỹ ủy thác", f"{pes_share}% chuyển vào Quỹ PES, {100 - pes_share}% duy trì trạm GIS/MRV."),
            ("BQL và hộ dân", "Chi trả PES cho hộ nhận khoán giữ rừng, tuần tra bãi bồi ven sông."),
            ("Lưu giữ carbon", f"Hơn {vn(POOLS[0][1])}% carbon được khóa trong bùn ngập triều."),
            ("Sổ cái Registry", "Cấp mã chứng nhận và retire tín chỉ để tránh tính trùng."),
        ]
    else:
        steps = [
            ("Thu gom", "Cành đước tỉa thưa định kỳ và rác nhựa dạt vào rừng."),
            ("Nhiệt phân", "Chuyển gỗ tỉa thưa thành than sinh học (Biochar) trong môi trường thiếu oxy."),
            ("Hoàn nguyên đất", "Bón Biochar trở lại nền đất ngập triều để cố định carbon lâu dài."),
            ("Vật liệu tuần hoàn", "Cung cấp bao bì sinh học cho doanh nghiệp thành viên."),
        ]
    for col, (i, (title, desc)) in zip(st.columns(len(steps)), enumerate(steps, 1)):
        with col:
            with st.container(border=True, height=170):
                st.markdown(f"**{i}. {title}**")
                st.caption(desc)


def page_market():
    if st.session_state.pop("trade_flash", None):
        c = st.session_state["last_cert"]
        st.success(f"Giao dịch thành công. {c['company']} đã bù đắp {vn(c['tons'], 2)} tCO2e.")

    _, available = available_credits()
    st.subheader("Sàn giao dịch tín chỉ")
    st.caption("Chọn gói bù đắp từ các lô tín chỉ Blue Carbon Cần Giờ. Giao dịch trong bản này là mô phỏng.")
    with st.container(border=True):
        m1, m2, m3 = st.columns(3)
        m1.metric("Tín chỉ còn lại trên sàn", f"{vn(available, 0)} tCO2e")
        m2.metric("Giá niêm yết", f"{usd(carbon_price, 2)}/tCO2e", help=f"Giá sàn hiện hành: {usd(floor_price, 2)}")
        m3.metric("Phát thải cần bù đắp", f"{vn(total_emissions_ton)} tCO2e")

    PKG = {"full": ("Bù đắp 100% (Net Zero)", 1.0), "p75": ("Bù đắp 75%", 0.75), "p50": ("Bù đắp 50%", 0.5)}

    def pkg_label(k):
        if k == "custom":
            return "Tự nhập số lượng"
        name, ratio = PKG[k]
        return f"{name}: {vn(total_emissions_ton * ratio, 2)} tCO2e"

    st.write("")
    left, right = st.columns(2, gap="large")
    with left:
        st.markdown("##### Chọn gói và thanh toán")
        pkg = st.radio("Gói bù đắp:", list(PKG) + ["custom"], format_func=pkg_label, key="pkg")
        if pkg == "custom":
            cap = max(1.0, available)
            offset_tons = st.number_input("Số tín chỉ muốn mua (tCO2e):", min_value=1.0, max_value=cap,
                                          value=min(max(1.0, float(round(total_emissions_ton))), cap), step=10.0)
        else:
            offset_tons = total_emissions_ton * PKG[pkg][1]
        offset_pct = (offset_tons / total_emissions_ton * 100.0) if total_emissions_ton > 0 else 0.0
        remaining = max(0.0, total_emissions_ton - offset_tons)
        trade_usd = offset_tons * carbon_price

        st.table(pd.DataFrame({
            "Khoản mục": ["Số lượng tín chỉ", "Đơn giá", "Tổng thanh toán (USD)", "Quy đổi (VNĐ)",
                          f"Trong đó: Quỹ PES hộ dân ({pes_share}%)", f"Trong đó: vận hành MRV, Registry ({100 - pes_share}%)"],
            "Giá trị": [f"{vn(offset_tons, 2)} tCO2e", f"{usd(carbon_price, 2)}/tCO2e", usd(trade_usd, 2),
                        f"{vn(trade_usd * usd_vnd_rate, 0)} đ", usd(trade_usd * pes_share / 100, 2),
                        usd(trade_usd * (100 - pes_share) / 100, 2)],
        }).set_index("Khoản mục"))

        if total_emissions_ton <= 0:
            st.warning("Chưa có phát thải để bù đắp. Hãy nhập dữ liệu ở tab Kiểm kê phát thải.")
        elif offset_tons > available:
            st.warning(f"Số lượng vượt tín chỉ còn lại ({vn(available, 0)} tCO2e). Hãy chọn gói nhỏ hơn.")
        can_trade = total_emissions_ton > 0 and 0 < offset_tons <= available
        if st.button("Xác nhận mua và retire tín chỉ", type="primary", use_container_width=True, disabled=not can_trade):
            ts = datetime.now()
            st.session_state["ledger"].append({
                "time": ts.strftime("%d/%m/%Y %H:%M"), "kind": "Doanh nghiệp", "buyer": company_name, "tons": offset_tons,
                "price": carbon_price, "revenue_usd": trade_usd, "pes_usd": trade_usd * pes_share / 100})
            st.session_state["last_cert"] = {
                "company": company_name, "tons": offset_tons, "pct": offset_pct, "remaining": remaining,
                "id": f"CG-{ts.strftime('%Y%m%d')}-{short_hash(company_name + ts.isoformat(), 10000, 0):04d}",
                "time": ts.strftime("%d/%m/%Y %H:%M:%S")}
            st.session_state["trade_flash"] = True
            st.rerun()

    with right:
        st.markdown("##### Chứng nhận bù đắp")
        cert = st.session_state["last_cert"]
        if cert is None:
            md('<div class="cert empty">Chứng nhận sẽ xuất hiện sau khi bạn xác nhận giao dịch.</div>')
        else:
            md(f"""
            <div class="cert">
              <div class="t">Chứng nhận bù đắp carbon</div>
              <div class="s">Tín chỉ Blue Carbon rừng ngập mặn Cần Giờ</div>
              <div>Cấp cho</div>
              <div class="org">{escape(cert['company'])}</div>
              <div class="n">{vn(cert['tons'], 2)} tCO2e</div>
              <div>Đã bù đắp {vn(cert['pct'])}% phát thải · Còn lại {vn(cert['remaining'], 2)} tCO2e</div>
              <div class="meta">
                Mã chứng nhận: {cert['id']}<br>
                Thời điểm cấp: {cert['time']}<br>
                Vị trí dự án: Cần Giờ, TP. Hồ Chí Minh<br>
                Trạng thái: đã retire trên sổ cái, không thể bán lại
              </div>
            </div>
            """)

    st.divider()
    with st.expander("Dự báo giá tín chỉ (mô phỏng, không phải khuyến nghị đầu tư)"):
        factors = [("T-9", 0.767, "Lịch sử"), ("T-6", 0.853, "Lịch sử"), ("T-3", 0.927, "Lịch sử"), ("Hiện tại", 1.0, "Hiện tại"),
                   ("+3 tháng", 1.233, "Dự báo"), ("+6 tháng", 1.653, "Dự báo"), ("+12 tháng", 2.2, "Dự báo")]
        fc = pd.DataFrame([{"Mốc": n, "Giá (USD)": carbon_price * f, "Loại": t} for n, f, t in factors])
        fig = px.bar(fc, x="Mốc", y="Giá (USD)", color="Loại", text_auto=".1f",
                     color_discrete_map={"Lịch sử": GREY, "Hiện tại": GREEN, "Dự báo": AMBER})
        style_fig(fig, 270)
        st.plotly_chart(fig, use_container_width=True)
        future = carbon_price * 1.653
        st.caption(f"Theo kịch bản này, giá sau 6 tháng khoảng {usd(future, 1)}/tấn (+{vn((future / carbon_price - 1) * 100)}%). "
                   f"Nếu mua ngay, doanh nghiệp tránh được khoảng {usd(total_emissions_ton * (future - carbon_price))} "
                   f"(~{vn(total_emissions_ton * (future - carbon_price) * usd_vnd_rate / 1e6)} triệu đ).")


def page_locked():
    st.subheader("Sàn giao dịch tín chỉ")
    with st.container(border=True):
        st.markdown("**Tài khoản cá nhân không mua được tín chỉ B2B**")
        st.write("Theo quy chế thị trường và Nghị định 06/2022/NĐ-CP, việc mua tín chỉ và cấp chứng nhận bù đắp phát thải "
                 "Scope 1 & 2 dành cho doanh nghiệp có tư cách pháp nhân kiểm kê.")
        st.caption(f"Vai trò hiện tại: {role['short_title']}. Vai trò được phép: doanh nghiệp phát thải hoặc quản trị viên.")
        if st.button("Chuyển sang vai trò Doanh nghiệp", type="primary"):
            st.session_state["role"] = "corporate"
            st.rerun()
    st.info("Bạn vẫn có thể góp cây giữ rừng ở tab Dấu chân cá nhân.")


def advisor_reply(q: str) -> str:
    ql = q.lower()
    if any(k in ql for k in ["retirement", "double counting", "tính trùng", "chống"]):
        return ("**Cơ chế retire chống tính trùng:**\n\n"
                "- Mỗi tín chỉ có mã định danh duy nhất trên sổ cái.\n"
                "- Khi doanh nghiệp bù đắp, tín chỉ được retire: khóa vĩnh viễn và không thể bán lại.\n"
                "- Chứng nhận ghi rõ đơn vị, khối lượng, thời điểm và mã lô để kiểm toán đối chiếu.")
    if any(k in ql for k in ["giải pháp", "giảm", "đánh giá", "mức phát thải"]):
        return (f"**Đánh giá phát thải của {company_name}:**\n\n"
                f"Tổng phát thải `{vn(total_emissions_ton)} tCO2e` (Scope 1: {vn(pct_of_total(total_scope1_ton))}%, "
                f"Scope 2: {vn(pct_of_total(total_scope2_ton))}%). Chi phí bù đắp ước tính {usd(offset_cost_usd, 2)} "
                f"(~{vn(offset_cost_vnd / 1e6)} triệu đ).\n\n"
                "Ba hướng giảm:\n\n"
                "1. **Scope 2:** lắp điện mặt trời mái nhà, giảm khoảng 30-40% điện mua từ lưới.\n"
                "2. **Scope 1:** tối ưu tuyến vận chuyển và điện hóa dần đội xe nội bộ.\n"
                "3. **Bù đắp:** mua tín chỉ Blue Carbon Cần Giờ cho phần còn lại chưa giảm được.")
    if any(k in ql for k in ["blue carbon", "hấp thụ", "rừng", "gấp"]):
        return (f"**Vì sao rừng ngập mặn Cần Giờ hấp thụ tốt ({vn(SEQ_RATE)} tCO2e/ha/năm):**\n\n"
                f"- **Trầm tích thiếu oxy:** carbon phân hủy rất chậm, khoảng {vn(POOLS[0][1])}% carbon nằm dưới lớp bùn.\n"
                "- **Hệ rễ dày:** rễ Đước, Mấm giữ lại phù sa hữu cơ từ sông Soài Rạp và Lòng Tàu.\n"
                "- **Khí hậu nhiệt đới:** cây tích lũy sinh khối quanh năm.")
    if any(k in ql for k in ["ngân sách", "giá", "esg"]):
        return (f"**Ngân sách ESG với giá {usd(carbon_price, 1)}/tCO2e:**\n\n"
                "- Giá có thể tăng khi sàn carbon quốc gia vận hành và CBAM mở rộng. Đây chỉ là kịch bản minh họa.\n"
                f"- Một cách chia: dành khoảng {usd(offset_cost_usd * 0.75)} mua trước 75% tín chỉ, "
                "phần còn lại đầu tư thiết bị tiết kiệm năng lượng.")
    return (f"Bạn hỏi về: *“{q}”*.\n\n"
            f"Với dữ liệu của {company_name} ({vn(total_emissions_ton)} tCO2e), nguồn cung tín chỉ từ rừng Cần Giờ đủ để bù đắp. "
            "Bạn có thể thử các câu hỏi gợi ý bên phải, hoặc sang tab Sàn giao dịch để mua tín chỉ.")


def page_advisor():
    st.subheader("Cố vấn Net Zero")
    st.caption("Trợ lý dùng số liệu kiểm kê hiện tại để trả lời. Đây là bộ trả lời theo quy tắc, không phải mô hình AI thật.")
    chat_col, side_col = st.columns([7, 3], gap="large")

    with side_col:
        st.markdown("##### Câu hỏi gợi ý")
        prompts = [
            f"Đánh giá mức phát thải {vn(total_emissions_ton)} tCO2 và đề xuất giải pháp giảm Scope 1 & 2",
            "Vì sao Blue Carbon Cần Giờ hấp thụ carbon tốt hơn rừng trên cạn?",
            f"Với giá {usd(carbon_price, 1)}/tCO2, nên phân bổ ngân sách ESG thế nào?",
            "Cơ chế retire chống tính trùng hoạt động ra sao?",
        ]
        for i, q in enumerate(prompts):
            if st.button(q, key=f"quick_{i}", use_container_width=True):
                st.session_state["selected_prompt"] = q
        with st.container(border=True):
            st.markdown("**Dữ liệu đang dùng**")
            st.caption(company_name)
            st.write(f"Scope 1: {vn(total_scope1_ton)} t  \nScope 2: {vn(total_scope2_ton)} t  \n"
                     f"Tổng: **{vn(total_emissions_ton)} tCO2e**  \nChi phí bù đắp: **{usd(offset_cost_usd)}**")

    with chat_col:
        box = st.container(height=440, border=True)
        with box:
            for m in st.session_state["chat_history"]:
                with st.chat_message(m["role"]):
                    st.markdown(m["content"])
        user_input = st.chat_input("Nhập câu hỏi...")
        preset = st.session_state.pop("selected_prompt", None)
        query = user_input or preset
        if query:
            st.session_state["chat_history"].append({"role": "user", "content": query})
            st.session_state["chat_history"].append({"role": "assistant", "content": advisor_reply(query)})
            st.rerun()


def page_citizen():
    st.subheader("Dấu chân carbon cá nhân")
    st.caption(f"Ước tính lượng CO2 bạn thải ra mỗi năm và góp cây Đước để giữ {vn(forest_ha, 0)} ha rừng Cần Giờ.")
    TRANSPORT = {"Xe máy xăng": 55, "Ô tô xăng": 170, "Xe điện EV": 65, "Xe buýt / Metro": 35}
    DIET = {"Nhiều thịt bò, thịt đỏ": 2.1, "Cân bằng thịt và rau": 1.4, "Ăn chay, thực vật": 0.8}

    left, right = st.columns(2, gap="large")
    with left:
        with st.container(border=True):
            st.markdown("**Thói quen sinh hoạt**")
            trans = st.selectbox("Phương tiện chính:", list(TRANSPORT), format_func=lambda k: f"{k} ({TRANSPORT[k]} g CO2/km)")
            km = st.slider("Quãng đường mỗi ngày (km):", 0, 100, 20)
            kwh = st.slider("Điện gia đình (kWh/tháng):", 50, 600, 180)
            diet = st.selectbox("Khẩu phần ăn:", list(DIET), format_func=lambda k: f"{k} ({vn(DIET[k])} tCO2/năm)")
        personal = (km * 365 * TRANSPORT[trans] / 1000 + kwh * 12 * grid_ef) / 1000 + DIET[diet]
        trees_needed = int(-(-personal * 1000 // TREE_KG_CO2))
        diff = personal - VN_AVG_FOOTPRINT
        with st.container(border=True):
            st.metric("Dấu chân carbon của bạn", f"{vn(personal, 2)} tCO2/năm",
                      delta=f"{'+' if diff > 0 else '-'}{vn(abs(diff), 2)} so với trung bình {vn(VN_AVG_FOOTPRINT)} tCO2/năm",
                      delta_color="inverse")
            st.caption(f"Cần khoảng {vn(trees_needed, 0)} cây Đước để trung hòa lượng này trong một năm.")

    with right:
        with st.container(border=True):
            st.markdown("**Góp cây giữ rừng Cần Giờ**")
            st.write(f"Mỗi cây Đước đôi trồng mới hấp thụ khoảng {TREE_KG_CO2} kg CO2/năm. "
                     f"Mỗi cây đóng góp {vn(TREE_PRICE_VND, 0)} đ, chuyển thẳng vào Quỹ PES hỗ trợ hộ dân giữ rừng.")
            trees = st.number_input("Số cây muốn bảo trợ:", min_value=1, max_value=1000, value=min(max(trees_needed, 1), 1000), step=1)
            cost_vnd = trees * TREE_PRICE_VND
            abs_kg = trees * TREE_KG_CO2
            a, b = st.columns(2)
            a.metric("Số tiền đóng góp", f"{vn(cost_vnd, 0)} đ")
            b.metric("CO2 trung hòa", f"~{vn(abs_kg, 0)} kg/năm")
            if st.button("Đóng góp", type="primary", use_container_width=True):
                rev = cost_vnd / usd_vnd_rate
                st.session_state["ledger"].append({
                    "time": datetime.now().strftime("%d/%m/%Y %H:%M"), "kind": "Cá nhân", "buyer": role["name"],
                    "tons": abs_kg / 1000, "price": 0.0, "revenue_usd": rev, "pes_usd": rev})
                st.success(f"Cảm ơn {role['name']}! Bạn đã bảo trợ {trees} cây Đước đôi tại Cần Giờ.")


def page_issuance():
    if st.session_state.pop("zone_flash", None):
        st.success("Đã cập nhật mật độ trữ lượng. Các trang khác dùng số liệu mới.")
    st.subheader("Quản lý rừng và phát hành tín chỉ")
    st.caption("Cập nhật mật độ trữ lượng các phân khu, phát hành lô tín chỉ mới và theo dõi Quỹ PES.")

    left, right = st.columns(2, gap="large")
    with left:
        with st.container(border=True):
            st.markdown("**Mật độ trữ lượng theo phân khu**")
            st.caption("Sửa cột mật độ rồi bấm lưu.")
            edited = st.data_editor(
                zones[["Phân khu bảo tồn", "Diện tích (ha)", "Mật độ trữ lượng (tCO2/ha)"]],
                disabled=["Phân khu bảo tồn", "Diện tích (ha)"], hide_index=True, use_container_width=True, key="zone_editor",
                column_config={"Mật độ trữ lượng (tCO2/ha)": st.column_config.NumberColumn(min_value=1.0, max_value=2000.0, step=1.0)})
            if st.button("Lưu mật độ", use_container_width=True):
                new_zones = zones.copy()
                new_zones["Mật độ trữ lượng (tCO2/ha)"] = edited["Mật độ trữ lượng (tCO2/ha)"].astype(float).values
                st.session_state["zones"] = new_zones
                st.session_state["zone_flash"] = True
                st.rerun()
    with right:
        with st.container(border=True):
            st.markdown("**Phát hành lô tín chỉ mới**")
            name = st.text_input("Tên đợt:", value="Đợt 3 - Khu phục hồi sinh thái An Thới Đông")
            standard = st.selectbox("Tiêu chuẩn xác thực:", [
                "Verra VCS (VM0033 Tidal Wetland)", "Plan Vivo Blue Carbon Standard", "TCVN 13324:2025 Kiểm kê Blue Carbon"])
            a, b = st.columns(2)
            tons = a.number_input("Khối lượng (tCO2e):", min_value=1000.0, value=50000.0, step=5000.0, format="%.0f")
            price = b.number_input("Giá sàn ($/tCO2e):", min_value=5.0, value=max(15.0, floor_price), step=0.5)
            if st.button("Phát hành lên sàn", type="primary", use_container_width=True):
                if price < floor_price:
                    st.error(f"Giá sàn của lô phải từ {usd(floor_price, 2)}/tCO2e trở lên (quy định của Admin).")
                elif not name.strip():
                    st.error("Vui lòng nhập tên đợt phát hành.")
                else:
                    n = len(st.session_state["batches"]) + 1
                    st.session_state["batches"].append({
                        "Mã lô": f"BC-{n:03d}", "Tên đợt": name.strip(), "Tiêu chuẩn": standard,
                        "Khối lượng (tCO2e)": tons, "Giá sàn ($/tCO2e)": price, "Ngày": datetime.now().strftime("%d/%m/%Y")})
                    st.success(f"Đã phát hành lô {name.strip()} ({vn(tons, 0)} tCO2e, {usd(price, 2)}/tấn).")

    st.markdown("##### Sổ cái các lô đã phát hành")
    reg = pd.DataFrame(st.session_state["batches"])
    reg["Khối lượng (tCO2e)"] = reg["Khối lượng (tCO2e)"].map(lambda v: vn(v, 0))
    reg["Giá sàn ($/tCO2e)"] = reg["Giá sàn ($/tCO2e)"].map(lambda v: vn(v, 2))
    st.dataframe(reg, use_container_width=True, hide_index=True)
    supply, available = available_credits()
    st.caption(f"Tổng đã phát hành {vn(supply, 0)} tCO2e, còn lại trên sàn {vn(available, 0)} tCO2e.")

    st.divider()
    st.markdown("#### Quỹ PES cho hộ dân giữ rừng")
    st.caption(f"Tỷ lệ hiện hành: {pes_share}% giá trị giao dịch doanh nghiệp; đóng góp cây của cá nhân chuyển toàn bộ vào quỹ.")
    pes_total = sum(t["pes_usd"] for t in st.session_state["ledger"])
    rev_total = sum(t["revenue_usd"] for t in st.session_state["ledger"])
    with st.container(border=True):
        p1, p2, p3 = st.columns(3)
        p1.metric("Doanh thu ghi nhận", usd(rev_total, 2))
        p2.metric("Quỹ PES đã phân bổ", usd(pes_total, 2), help=f"~{vn(pes_total * usd_vnd_rate / 1e6)} triệu đ")
        p3.metric("Bình quân mỗi hộ", f"{vn(pes_total * usd_vnd_rate / HOUSEHOLDS, 0)} đ", help=f"Giả định {vn(HOUSEHOLDS, 0)} hộ nhận khoán")
    if not st.session_state["ledger"]:
        st.caption("Chưa có giao dịch. Số liệu sẽ xuất hiện khi doanh nghiệp mua tín chỉ hoặc cá nhân góp cây.")


def page_admin():
    if st.session_state.pop("admin_flash", None):
        st.success("Đã lưu. Tham số mới được áp dụng cho toàn bộ hệ thống.")
    st.subheader("Quản trị hệ thống")
    left, right = st.columns([3, 2], gap="large")
    with left:
        st.markdown("##### Người dùng")
        users = pd.DataFrame([{"Người dùng": r["name"], "Đơn vị": r["org"], "Vai trò": r["short_title"],
                               "Trạng thái": "Quản trị" if k == "admin" else "Đã duyệt"} for k, r in ROLES_DATA.items()])
        st.dataframe(users, use_container_width=True, hide_index=True)
    with right:
        with st.container(border=True):
            st.markdown("**Tham số toàn hệ thống**")
            with st.form("admin_params"):
                grid = st.number_input("Hệ số lưới điện (kg CO2/kWh):", min_value=0.0, value=float(st.session_state["grid_ef"]), step=0.0001, format="%.4f")
                pet = st.number_input("Hệ số xăng RON 95 (kg CO2/lít):", min_value=0.0, value=float(st.session_state["petrol_ef"]), step=0.01, format="%.4f")
                die = st.number_input("Hệ số dầu Diesel (kg CO2/lít):", min_value=0.0, value=float(st.session_state["diesel_ef"]), step=0.01, format="%.4f")
                floor = st.number_input("Giá sàn tín chỉ ($/tấn):", min_value=5.0, max_value=60.0, value=floor_price, step=0.5)
                pes = st.slider("Tỷ lệ Quỹ PES cho hộ dân (%):", 80, 99, pes_share)
                if st.form_submit_button("Lưu tham số", type="primary", use_container_width=True):
                    st.session_state["pending_params"] = {"grid_ef": grid, "petrol_ef": pet, "diesel_ef": die,
                                                          "floor_price": floor, "pes_share": pes}
                    st.session_state["admin_flash"] = True
                    st.rerun()

    st.divider()
    st.markdown("##### Sổ cái giao dịch")
    if st.session_state["ledger"]:
        led = pd.DataFrame(st.session_state["ledger"]).rename(columns={
            "time": "Thời điểm", "kind": "Loại", "buyer": "Bên mua", "tons": "Khối lượng (tCO2e)",
            "price": "Đơn giá ($)", "revenue_usd": "Doanh thu (USD)", "pes_usd": "Quỹ PES (USD)"})
        st.dataframe(led, use_container_width=True, hide_index=True)
    else:
        st.info("Chưa có giao dịch nào trong phiên này.")


# ==============================================================================
# 9. TAB THEO VAI TRÒ
# ==============================================================================
PAGES = {
    "corporate": [("Kiểm kê phát thải", page_inventory), ("Rừng Cần Giờ", page_forest),
                  ("Sàn giao dịch", page_market), ("Cố vấn Net Zero", page_advisor)],
    "forest_authority": [("Quản lý & phát hành tín chỉ", page_issuance), ("Rừng Cần Giờ", page_forest)],
    "citizen": [("Dấu chân cá nhân", page_citizen), ("Rừng Cần Giờ", page_forest), ("Sàn giao dịch (bị khóa)", page_locked)],
    "admin": [("Kiểm kê phát thải", page_inventory), ("Rừng Cần Giờ", page_forest), ("Sàn giao dịch", page_market),
              ("Cố vấn Net Zero", page_advisor), ("Quản lý & phát hành tín chỉ", page_issuance), ("Quản trị", page_admin)],
}

pages = PAGES[role_key]
for tab, (_, render) in zip(st.tabs([label for label, _ in pages]), pages):
    with tab:
        render()

st.divider()
st.caption("CarbonLens 2026 · Đề tài nghiên cứu Kinh tế tuần hoàn và thị trường tín chỉ carbon rừng ngập mặn Cần Giờ · "
           "Tính toán theo GHG Protocol và hệ số IPCC. Số liệu giao dịch và dự báo là mô phỏng.")
