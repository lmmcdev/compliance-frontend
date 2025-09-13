export interface License {
  id: string;
  type: string;
  issuer: string;
  issueDate: Date;
  expirationDate: Date;
  status: 'active' | 'expired' | 'pending';
  documentUrl?: string;
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
  documents: Document[];
  notes: string;
}

export interface Document {
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