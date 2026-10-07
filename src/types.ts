export interface EmissionInputs {
  companyName: string;
  industry: string;
  scale: 'small' | 'medium' | 'large';
  period: 'year' | 'quarter' | 'month';
  electricityKWh: number;
  petrolLiters: number;
  dieselLiters: number;
}

export interface EmissionFactors {
  gridElectricity: number; // kg CO2 / kWh
  petrol: number;          // kg CO2 / liter
  diesel: number;          // kg CO2 / liter
}

export interface EmissionResults {
  scope1PetrolTon: number;
  scope1DieselTon: number;
  totalScope1Ton: number;
  totalScope2Ton: number;
  totalEmissionTon: number;
  offsetCostUSD: number;
  offsetCostVND: number;
}

export interface MangroveZone {
  name: string;
  areaHa: number;
  dominantSpecies: string;
  carbonDensityTonPerHa: number;
  description: string;
}

export interface OffsetTransaction {
  id: string;
  companyName: string;
  tons: number;
  unitPriceUSD: number;
  totalUSD: number;
  totalVND: number;
  managementFeeUSD: number;
  timestamp: string;
  serialNumber: string;
  gpsCoordinates: string;
  packageName: string;
}

export interface ScenarioInputs {
  solarPercentage: number;          // % điện mặt trời áp mái (giảm Scope 2)
  logisticsOptPercentage: number;   // % tối ưu hóa lộ trình vận tải (giảm xăng dầu Scope 1)
  evFleetPercentage: number;        // % chuyển đổi xe điện (thay thế xăng dầu Scope 1)
  energyEfficiencyPercentage: number; // % tiết kiệm điện nhờ công nghệ/IoT (giảm Scope 2)
}

export interface ScenarioResults {
  mitigatedScope1Ton: number;
  mitigatedScope2Ton: number;
  mitigatedTotalTon: number;
  abatedTon: number;
  abatedPercentage: number;
  originalCostUSD: number;
  mitigatedCostUSD: number;
  costSavedUSD: number;
  costSavedVND: number;
  energyOpexSavedVND: number;
}

export type UserRole = 'corporate' | 'forest_authority' | 'citizen' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarLetter: string;
  title: string;
  joinDate: string;
  verified: boolean;
  unlockedFeatures: string[];
}
