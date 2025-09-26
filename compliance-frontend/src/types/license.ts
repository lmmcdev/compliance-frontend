export interface BoundingRegion {
  pageNumber: number;
  polygon: number[];
}

export interface LicenseField {
  name: string;
  value: string;
  confidence: number;
  type: string;
  boundingRegions: BoundingRegion[];
  editable?: boolean;
}

export interface LicenseTable {
  id: string;
  rowCount: number;
  columnCount: number;
  rows: string[][];
  confidence: number;
  boundingRegions: BoundingRegion[];
}

export interface LicenseData {
  success: boolean;
  data?: {
    result?: {
      fields?: LicenseField[];
      tables?: LicenseTable[];
      content?: string;
      pages?: number;
    };
    analyzeResult?: {
      modelId?: string;
      apiVersion?: string;
      documentsCount?: number;
    };
    timestamp?: string;
  };
  meta?: {
    traceId?: string;
  };
  // Support for dynamic JSON structures - fields could be at different paths
  fields?: LicenseField[];
  result?: {
    fields?: LicenseField[];
    tables?: LicenseTable[];
    content?: string;
    pages?: number;
  };
  // Allow any additional properties for flexible JSON parsing
  [key: string]: any;
}

export interface LicenseUploadState {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  data: LicenseData | null;
  file: File | null;
}

export interface LicenseFieldEditState {
  editableFields: Record<string, string>;
  isEditing: Record<string, boolean>;
  hasChanges: boolean;
}