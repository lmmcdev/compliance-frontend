/**
 * ExtractedFieldsForm Module
 *
 * A reusable form component for displaying and editing dynamically extracted document fields.
 * Designed for document upload workflows where fields are extracted via OCR or AI processing.
 */

export { ExtractedFieldsForm } from './ExtractedFieldsForm';
export { FieldCard } from './FieldCard';
export { MetadataPanel } from './MetadataPanel';
export type {
  ExtractedField,
  DocumentMetadata,
  ConfidenceInfo,
  ExtractedFieldsFormProps,
  FieldCardProps,
  MetadataPanelProps,
} from './types';