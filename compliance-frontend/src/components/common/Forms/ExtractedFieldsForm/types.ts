/**
 * Types for ExtractedFieldsForm component
 * Used for displaying and editing dynamically extracted document fields
 */

export interface ExtractedField {
  name: string;
  value: string | number;
  confidence: number;
  type?: 'string' | 'number' | 'date' | 'email' | 'phone' | 'address' | 'text';
  // Additional optional metadata fields
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  page?: number;
  rawText?: string;
  source?: string;
  validationRules?: string[];
  required?: boolean;
  description?: string;
  category?: string;
  [key: string]: any; // Allow any additional properties from extraction
}

export interface DocumentMetadata {
  licenseType?: string;
  documentType?: string;
  processingTime?: number;
  confidence?: number;
}

export interface ConfidenceInfo {
  label: string;
  color: 'success' | 'warning' | 'error';
  icon: React.ComponentType;
}

export interface ExtractedFieldsFormProps {
  fields: ExtractedField[];
  metadata?: DocumentMetadata;
  initialValues: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface FieldCardProps {
  field: ExtractedField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export interface MetadataPanelProps {
  metadata?: DocumentMetadata;
  fieldsCount: number;
}