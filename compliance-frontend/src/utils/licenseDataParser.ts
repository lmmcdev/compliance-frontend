import type { LicenseData } from '../types/license';
import { extractFields, getValidFields } from './fieldExtractor';

/**
 * Parses license response from API with error handling
 */
export const parseLicenseResponse = (response: any): LicenseData => {
  console.log('[License Parser] Parsing response:', response);

  if (!response) {
    throw new Error('No response received');
  }

  // Handle error responses
  if (response.error) {
    console.error('[License Parser] Response contains error:', response.error);
    throw new Error(response.error.message || response.error);
  }

  // Extract webhook response if it exists
  const licenseData = response.webhookResponse || response;

  // Validate the response structure
  if (typeof licenseData !== 'object') {
    throw new Error('Invalid response format: expected object');
  }

  console.log('[License Parser] Parsed license data:', licenseData);
  return licenseData as LicenseData;
};

/**
 * Validates license data structure
 */
export const validateLicenseData = (data: LicenseData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data) {
    errors.push('License data is null or undefined');
    return { isValid: false, errors };
  }

  if (typeof data.success !== 'boolean') {
    errors.push('Missing or invalid success field');
  }

  if (!data.success && !data.error) {
    errors.push('Response indicates failure but no error message provided');
  }

  // Check for fields in any valid location
  const hasFields = !!(
    data?.data?.result?.fields ||
    data?.fields ||
    data?.result?.fields
  );

  if (data.success && !hasFields) {
    console.warn('[License Parser] Response successful but no fields found');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Extracts metadata from license data
 */
export const extractMetadata = (data: LicenseData) => {
  return {
    modelId: data?.data?.analyzeResult?.modelId || 'N/A',
    pages: data?.data?.result?.pages || data?.result?.pages || 'N/A',
    apiVersion: data?.data?.analyzeResult?.apiVersion || 'N/A',
    documentsCount: data?.data?.analyzeResult?.documentsCount || 1,
    timestamp: data?.data?.timestamp || new Date().toISOString(),
    traceId: data?.meta?.traceId || 'N/A'
  };
};

/**
 * Checks if license data has tables
 */
export const hasTables = (data: LicenseData): boolean => {
  const tables = data?.data?.result?.tables || data?.result?.tables;
  return !!(tables && Array.isArray(tables) && tables.length > 0);
};

/**
 * Extracts tables from license data
 */
export const extractTables = (data: LicenseData) => {
  return data?.data?.result?.tables || data?.result?.tables || [];
};

/**
 * Gets field count from license data
 */
export const getFieldCount = (data: LicenseData | null): number => {
  const fields = extractFields(data);
  return getValidFields(fields).length;
};