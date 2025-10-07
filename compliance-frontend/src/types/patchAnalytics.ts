// Patch Analytics Types

export interface PatchAnalyticsSummary {
  totalPatches: number;
  totalInstalled: number;
  totalPending: number;
  totalFailed: number;
  overallComplianceRate: number;
  dateRange: {
    start: string;
    end: string;
  };
  uniqueSites: number;
  uniqueDevices: number;
}

export interface ClassificationBreakdown {
  installed: number;
  pending: number;
  failed: number;
  total: number;
}

export interface StatusEntry {
  status: string;
  count: number;
}

export interface ClassificationEntry {
  classification: string;
  count: number;
  byStatus: StatusEntry[];
}

export interface ComplianceByPatchType {
  patchType: string;
  totalPatches: number;
  installed: number;
  pending: number;
  failed: number;
  complianceRate: number;
  byStatus: StatusEntry[];
  byClassification?: ClassificationEntry[];
}

export interface TemporalTrend {
  date: string;
  installed: number;
  pending: number;
  failed: number;
  total: number;
  byClassification: Record<string, ClassificationBreakdown>;
}

export interface ComplianceBySite {
  siteName: string;
  totalPatches: number;
  installed: number;
  pending: number;
  failed: number;
  complianceRate: number;
  byStatus: StatusEntry[];
  byClassification?: ClassificationEntry[];
}

export interface PatchDeviceEntry {
  Device_name: string;
  Patch_status: string;
}

export interface PatchesBySiteAndKB {
  KB_number: string;
  devices: PatchDeviceEntry[];
}

export interface PatchAnalyticsData {
  summary: PatchAnalyticsSummary;
  complianceByPatchType: ComplianceByPatchType[];
  temporalTrend: TemporalTrend[];
  complianceBySite: ComplianceBySite[];
  patchesBySiteAndKB?: PatchesBySiteAndKB[];
  timestamp: string;
}

export interface PatchAnalyticsResponse {
  success: boolean;
  data: PatchAnalyticsData;
  meta: {
    traceId: string;
  };
}

export interface PatchAnalyticsFilters {
  month?: string;
  Classification?: string;
  Patch_status?: string;
  Site_name?: string;
}

export type PatchStatus = 'Installed' | 'Pending' | 'Failed' | '';
export type PatchClassification = 'Definition Updates' | 'Security Updates' | 'Critical Updates' | 'Feature Updates' | '';

// Device Count Types
export interface DeviceCountBySite {
  siteName: string;
  count: number;
}

export interface DeviceEquipment {
  Device_name: string;
  Hostname: string;
}

export interface DeviceCountData {
  total: number;
  bySite: DeviceCountBySite[];
  equipment?: DeviceEquipment[];
  filters: Record<string, any>;
}

export interface DeviceCountResponse {
  success: boolean;
  data: DeviceCountData;
  meta: {
    traceId: string;
  };
}
