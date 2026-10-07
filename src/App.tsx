import React, { useState, useMemo } from 'react';
import { Header, TabType } from './components/Header';
import { RoleBanner } from './components/RoleBanner';
import { AuthModal } from './components/AuthModal';
import { LoginGateway } from './components/LoginGateway';
import { LockedFeatureScreen } from './components/LockedFeatureScreen';
import { CarbonCalculatorTab } from './components/CarbonCalculatorTab';
import { EcoDashboardTab } from './components/EcoDashboardTab';
import { TradingHubTab } from './components/TradingHubTab';
import { AIConsultantTab } from './components/AIConsultantTab';
import { ForestAuthorityTab } from './components/ForestAuthorityTab';
import { CitizenFootprintTab } from './components/CitizenFootprintTab';
import { AdminDashboardTab } from './components/AdminDashboardTab';
import { PythonSourceModal } from './components/PythonSourceModal';
import { 
  DEFAULT_EMISSION_FACTORS, 
  DEFAULT_USD_VND_RATE, 
  DEFAULT_CARBON_PRICE_USD,
  PYTHON_SOURCE_CODE 
} from './constants/scienceData';
import { DEMO_USERS } from './constants/userData';
import { EmissionInputs, EmissionFactors, EmissionResults, UserProfile, UserRole } from './types';

export default function App() {
  // Authentication & Role State - Login Gateway Layer as entry point
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.corporate);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  // Input states for Corporate Emission Calculator
  const [inputs, setInputs] = useState<EmissionInputs>({
    companyName: 'Tập đoàn Công nghệ & Sản xuất Á Châu',
    industry: 'Chế biến & Sản xuất công nghiệp',
    scale: 'medium',
    period: 'year',
    electricityKWh: 350000,
    petrolLiters: 18000,
    dieselLiters: 25000,
  });

  const [factors, setFactors] = useState<EmissionFactors>(DEFAULT_EMISSION_FACTORS);
  const [carbonPrice, setCarbonPrice] = useState<number>(DEFAULT_CARBON_PRICE_USD);
  const [usdRate] = useState<number>(DEFAULT_USD_VND_RATE);

  // Calculation Engine
  const results: EmissionResults = useMemo(() => {
    const scope1PetrolTon = (inputs.petrolLiters * factors.petrol) / 1000.0;
    const scope1DieselTon = (inputs.dieselLiters * factors.diesel) / 1000.0;
    const totalScope1Ton = scope1PetrolTon + scope1DieselTon;
    const totalScope2Ton = (inputs.electricityKWh * factors.gridElectricity) / 1000.0;
    const totalEmissionTon = totalScope1Ton + totalScope2Ton;
    const offsetCostUSD = totalEmissionTon * carbonPrice;
    const offsetCostVND = offsetCostUSD * usdRate;

    return {
      scope1PetrolTon,
      scope1DieselTon,
      totalScope1Ton,
      totalScope2Ton,
      totalEmissionTon,
      offsetCostUSD,
      offsetCostVND,
    };
  }, [inputs, factors, carbonPrice, usdRate]);

  // Handle Login from Gateway
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);

    // Route smartly to role's primary tab
    if (user.role === 'citizen') {
      setActiveTab('citizen');
    } else if (user.role === 'forest_authority') {
      setActiveTab('forest_authority');
    } else if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('calculator');
    }
  };

  // Handle Role Switch in-app
  const handleSelectRole = (role: UserRole) => {
    const nextUser = DEMO_USERS[role];
    setCurrentUser(nextUser);
    if (role === 'citizen' && activeTab === 'trading') {
      // Keep on trading to demonstrate lock screen if currently on trading, or switch
    } else if (role === 'citizen') {
      setActiveTab('citizen');
    } else if (role === 'forest_authority') {
      setActiveTab('forest_authority');
    } else if (role === 'admin') {
      setActiveTab('admin');
    }
  };

  // Download Python app.py
  const handleDownloadPython = () => {
    const blob = new Blob([PYTHON_SOURCE_CODE], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // LAYER 1: If user is not yet logged in, show the dedicated 4-Role Login Gateway!
  if (!isLoggedIn) {
    return <LoginGateway onLogin={handleLogin} />;
  }

  // LAYER 2: Main Application Interface after Role Login
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* 1. Header with dynamic role-based navigation and switch account */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadPython={handleDownloadPython}
        currentUser={currentUser}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* 2. Persistent Role Status Banner & Quick Role Switcher */}
      <RoleBanner
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSelectRole={handleSelectRole}
      />

      {/* 3. Main Workspace Container with Role Permissions Enforcement */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Carbon Calculator (Scope 1 & 2) */}
        {activeTab === 'calculator' && (
          <CarbonCalculatorTab
            inputs={inputs}
            setInputs={setInputs}
            factors={factors}
            setFactors={setFactors}
            carbonPrice={carbonPrice}
            setCarbonPrice={setCarbonPrice}
            usdRate={usdRate}
            results={results}
            onProceedToTrade={() => {
              if (currentUser.role === 'citizen') {
                setActiveTab('trading'); // Will show lock screen
              } else {
                setActiveTab('trading');
              }
            }}
          />
        )}

        {/* Tab 2: Can Gio Eco Dashboard & Reverse Logistics */}
        {activeTab === 'eco' && <EcoDashboardTab />}

        {/* Tab 3: Trading Hub - Strictly Locked for Citizen as requested */}
        {activeTab === 'trading' && (
          currentUser.role === 'citizen' ? (
            <LockedFeatureScreen
              featureTitle="Sàn Giao Dịch & Mua Tín Chỉ Carbon B2B (Retirement Hub)"
              requiredRoleName="Doanh nghiệp phát thải (Corporate) hoặc Quản trị viên (Admin)"
              currentUser={currentUser}
              reason="Theo quy chế thị trường và Nghị định 06/2022/NĐ-CP, việc đặt mua và cấp Chứng nhận số bù đắp phát thải Scope 1 & 2 được thiết kế riêng cho các đơn vị Doanh nghiệp có tư cách pháp nhân kiểm kê. Tài khoản Cá nhân không có quyền thực hiện giao dịch mua tín chỉ B2B."
              onSwitchRole={handleSelectRole}
              onNavigateAlternative={() => setActiveTab('citizen')}
              alternativeTitle="Chuyển sang Chương trình Góp cây Giữ rừng Cần Giờ"
            />
          ) : (
            <TradingHubTab
              inputs={inputs}
              results={results}
              carbonPrice={carbonPrice}
              setCarbonPrice={setCarbonPrice}
              usdRate={usdRate}
            />
          )
        )}

        {/* Role-Specific Tab: Citizen Footprint & Community Planting */}
        {activeTab === 'citizen' && (
          <CitizenFootprintTab 
            onSwitchToCorporate={() => handleSelectRole('corporate')} 
          />
        )}

        {/* Role-Specific Tab: Forest Authority Mangrove & Credit Issuance */}
        {activeTab === 'forest_authority' && (
          <ForestAuthorityTab />
        )}

        {/* Role-Specific Tab: System Admin Center */}
        {activeTab === 'admin' && (
          <AdminDashboardTab />
        )}

        {/* Tab 4: AI Consultant */}
        {activeTab === 'ai' && (
          <AIConsultantTab
            inputs={inputs}
            results={results}
            carbonPrice={carbonPrice}
          />
        )}

        {/* Modal/Tab: Python app.py View */}
        {activeTab === 'python' && (
          <PythonSourceModal onDownload={handleDownloadPython} />
        )}
      </main>

      {/* Interactive In-App Auth & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          if (u.role === 'citizen') setActiveTab('citizen');
          else if (u.role === 'forest_authority') setActiveTab('forest_authority');
          else if (u.role === 'admin') setActiveTab('admin');
        }}
      />

      {/* Standard Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">CarbonLens</span>
            <span>·</span>
            <span>Kinh tế tuần hoàn & Sàn Tín chỉ Blue Carbon Rừng Ngập Mặn Cần Giờ</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Phân quyền 4 nhóm: Doanh nghiệp · BQL Rừng · Cá nhân · Quản trị viên</span>
            <span>·</span>
            <span>GHG Protocol & IPCC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
