/**
 * FileUpload Component
 *
 * Reusable file upload component with drag-and-drop support.
 * Can operate in two modes:
 * 1. Self-contained: Handles upload internally (showUploadButton=true)
 * 2. Controlled: Parent handles upload via onFileChange callback (showUploadButton=false)
 */

export { default as FileUpload } from './FileUpload';
export type { FileUploadProps } from './FileUpload';