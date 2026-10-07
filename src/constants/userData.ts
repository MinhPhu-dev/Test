import { UserProfile, UserRole } from '../types';

export interface RoleConfig {
  role: UserRole;
  title: string;
  shortTitle: string;
  badgeText: string;
  badgeBg: string;
  badgeBorder: string;
  badgeTextCol: string;
  purpose: string;
  unlockedFeatures: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  corporate: {
    role: 'corporate',
    title: 'Nhóm 1: Doanh nghiệp phát thải (Emitter / Corporate User)',
    shortTitle: 'Doanh nghiệp phát thải',
    badgeText: 'Doanh nghiệp (Scope 1 & 2)',
    badgeBg: 'bg-emerald-950/60',
    badgeBorder: 'border-emerald-500/40',
    badgeTextCol: 'text-emerald-400',
    purpose: 'Đối tượng khách hàng cốt lõi cần giải quyết bài toán kiểm kê và tuân thủ giảm phát thải.',
    unlockedFeatures: [
      'Nhập liệu tiêu thụ năng lượng/nhiên liệu (Điện lưới, Xăng, Dầu)',
      'Tự động tính toán Scope 1, Scope 2, Scope 3',
      'Xuất báo cáo ESG & LCA chuẩn GHG Protocol / IPCC',
      'Truy cập sàn giao dịch để mua tín chỉ carbon Cần Giờ bù đắp Net Zero',
      'Tư vấn tự động cùng Cố vấn AI về giải pháp chuyển dịch năng lượng'
    ]
  },
  forest_authority: {
    role: 'forest_authority',
    title: 'Nhóm 2: Đơn vị quản lý / Chủ rừng sinh quyển (Forest Manager / Cần Giờ Authority)',
    shortTitle: 'BQL Rừng Cần Giờ',
    badgeText: 'Chủ rừng & BQL Cần Giờ',
    badgeBg: 'bg-sky-950/60',
    badgeBorder: 'border-sky-500/40',
    badgeTextCol: 'text-sky-400',
    purpose: 'Đại diện cho phía cung (Supply) trên thị trường tín chỉ carbon.',
    unlockedFeatures: [
      'Cập nhật dữ liệu sinh khối, diện tích 35.120 ha rừng ngập mặn Cần Giờ',
      'Cập nhật chỉ số hấp thụ carbon thực tế theo 4 phân khu sinh quyển',
      'Quản lý và phát hành các lô tín chỉ Blue Carbon mới (VCS / Plan Vivo)',
      'Theo dõi lịch sử giao dịch và phân bổ 95% doanh thu Quỹ PES cho 1.000+ hộ dân',
      'Giám sát viễn thám GIS và biến động trầm tích yếm khí'
    ]
  },
  citizen: {
    role: 'citizen',
    title: 'Nhóm 3: Người tiêu dùng thông thường / Cá nhân (Individual Citizen / Consumer)',
    shortTitle: 'Cá nhân & Người tiêu dùng',
    badgeText: 'Cá nhân / Người tiêu dùng',
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-500/40',
    badgeTextCol: 'text-amber-400',
    purpose: 'Giáo dục cộng đồng, nâng cao nhận thức xã hội (Public Awareness).',
    unlockedFeatures: [
      'Tra cứu dấu chân carbon cá nhân (Đi lại, điện sinh hoạt, thói quen ăn uống)',
      'So sánh lượng phát thải cá nhân với mức trung bình Việt Nam (1.8 tCO2/năm)',
      'Chương trình cộng đồng: Góp cây giữ rừng Cần Giờ (25.000 VNĐ/cây Đước)',
      'Xem dashboard tổng quan về tình trạng sinh quyển rừng ngập mặn Cần Giờ',
      'Cẩm nang kiến thức về kinh tế tuần hoàn và lối sống Net Zero'
    ]
  },
  admin: {
    role: 'admin',
    title: 'Nhóm 4: Quản trị viên hệ thống (System Administrator)',
    shortTitle: 'Quản trị viên Hệ thống',
    badgeText: 'Quản trị viên (Admin)',
    badgeBg: 'bg-purple-950/60',
    badgeBorder: 'border-purple-500/40',
    badgeTextCol: 'text-purple-400',
    purpose: 'Toàn quyền kiểm duyệt, quản lý tài khoản, cấu hình tham số hệ thống.',
    unlockedFeatures: [
      'Quản lý tài khoản người dùng của cả 4 nhóm (Phân quyền & Kiểm duyệt)',
      'Kiểm duyệt dữ liệu phát thải doanh nghiệp & dữ liệu sinh khối rừng',
      'Cấu hình hệ số phát thải quốc gia (Bộ TN&MT, IPCC) & Giá sàn tín chỉ',
      'Theo dõi toàn bộ hoạt động của sàn giao dịch mô phỏng & Sổ cái chuỗi khối',
      'Toàn quyền truy cập tất cả phân hệ và xuất báo cáo kiểm toán tổng thể'
    ]
  }
};

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  corporate: {
    id: 'usr_corp_01',
    name: 'Nguyễn Minh Tuấn',
    email: 'tuan.nguyen@vingreen-logistics.vn',
    role: 'corporate',
    organization: 'Tập đoàn Công nghệ & Sản xuất Á Châu',
    avatarLetter: 'T',
    title: 'Giám đốc ESG & Phát triển bền vững',
    joinDate: '15/01/2026',
    verified: true,
    unlockedFeatures: ROLE_CONFIGS.corporate.unlockedFeatures
  },
  forest_authority: {
    id: 'usr_forest_02',
    name: 'TS. Lê Văn Thắng',
    email: 'thang.le@cangio-biosphere.gov.vn',
    role: 'forest_authority',
    organization: 'Ban Quản Lý Khu Dự Trữ Sinh Quyển Rừng Ngập Mặn Cần Giờ',
    avatarLetter: 'L',
    title: 'Trưởng phòng Quản lý Bảo tồn & Đo đạc MRV',
    joinDate: '10/02/2026',
    verified: true,
    unlockedFeatures: ROLE_CONFIGS.forest_authority.unlockedFeatures
  },
  citizen: {
    id: 'usr_citizen_03',
    name: 'Trần Hoàng Nam',
    email: 'hoangnam.tran@gmail.com',
    role: 'citizen',
    organization: 'Cá nhân tình nguyện viên Net Zero',
    avatarLetter: 'N',
    title: 'Công dân tiên phong Lối sống xanh',
    joinDate: '01/03/2026',
    verified: true,
    unlockedFeatures: ROLE_CONFIGS.citizen.unlockedFeatures
  },
  admin: {
    id: 'usr_admin_04',
    name: 'Phạm Quốc Hùng',
    email: 'admin.super@carbonlens.vn',
    role: 'admin',
    organization: 'Trung tâm Vận hành Quốc gia CarbonLens',
    avatarLetter: 'A',
    title: 'Quản trị viên Hệ thống Cấp cao (Super Admin)',
    joinDate: '01/01/2026',
    verified: true,
    unlockedFeatures: ROLE_CONFIGS.admin.unlockedFeatures
  }
};
