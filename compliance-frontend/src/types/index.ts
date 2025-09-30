export interface License {
  id: string;
  code: string;
  displayName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Cosmos DB fields (optional)
  _rid?: string;
  _self?: string;
  _etag?: string;
  _attachments?: string;
  _ts?: number;
}

export interface LicenseData {
  type: string;
  issuer: string;
  issueDate: string;
  expirationDate: string;
  documentUrl?: string;
}

export interface ComplianceCase {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  createdDate: Date;
  updatedDate: Date;
  documents: ComplianceDocument[];
  notes: string;
}

export interface ComplianceDocument {
  id: string;
  name: string;
  url: string;
  uploadDate: Date;
  type: string;
}

export interface DashboardMetrics {
  licensesByType: { name: string; count: number }[];
  expiringLicenses: License[];
  complianceCasesByMonth: { month: string; count: number }[];
  totalLicenses: number;
  totalComplianceCases: number;
}