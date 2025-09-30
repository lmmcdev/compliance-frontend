/**
 * License Extraction Service
 * Handles parsing and processing of document extraction responses
 */

export interface ExtractedField {
  name: string;
  value: string | number;
  confidence: number;
  type?: string;
  page?: number;
  category?: string;
  description?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rawText?: string;
  source?: string;
  [key: string]: any;
}

export interface AnalyzeResult {
  modelId?: string;
  apiVersion?: string;
  documentsCount?: number;
  confidence?: number;
}

export interface ExtractedLicenseData {
  fields: ExtractedField[] | null;
  documentType: string;
  success: boolean;
  confidence?: number;
  metadata: {
    modelId?: string;
    apiVersion?: string;
    documentsCount?: number;
    analyzeResult?: AnalyzeResult;
    [key: string]: any;
  };
}

export const licenseExtractionService = {
  /**
   * Parse extraction response from document analysis webhook
   * Handles multiple response format variations:
   * - { success, data: { result: [{}], analyzeResult: {...} } }
   * - { success, data: { result: { fields: [...] }, analyzeResult: {...} } }
   * - { result: { fields: [...] } }
   * - { fields: [...] }
   */
  parseExtractionResponse(webhookData: any): ExtractedLicenseData {
    console.log('[LicenseExtractionService] Parsing response:', webhookData);

    let extractedFields: ExtractedField[] | null = null;
    let analyzeResult: AnalyzeResult | undefined = undefined;
    let documentType = 'Unknown';
    let confidence = 0;

    // Extract analyzeResult metadata if available
    if (webhookData.data?.analyzeResult) {
      analyzeResult = webhookData.data.analyzeResult;
      documentType = analyzeResult?.modelId || documentType;
      console.log('[LicenseExtractionService] Found analyzeResult:', analyzeResult);
    }

    // Try to extract fields from various possible structures
    if (webhookData.data?.result && Array.isArray(webhookData.data.result)) {
      // Format: { data: { result: [{...}] } }
      const resultData = webhookData.data.result[0] || {};
      extractedFields = resultData.fields || resultData;
      confidence = resultData.confidence || 0;
    } else if (webhookData.data?.result?.fields) {
      // Format: { data: { result: { fields: [...] } } }
      extractedFields = webhookData.data.result.fields;
      confidence = webhookData.data.result.confidence || 0;
    } else if (webhookData.result?.fields) {
      // Format: { result: { fields: [...] } }
      extractedFields = webhookData.result.fields;
      confidence = webhookData.result.confidence || 0;
      documentType = webhookData.result.licenseType || webhookData.result.documentType || documentType;
    } else if (webhookData.fields) {
      // Format: { fields: [...] }
      extractedFields = webhookData.fields;
      confidence = webhookData.confidence || 0;
      documentType = webhookData.licenseType || webhookData.documentType || documentType;
    }

    const result: ExtractedLicenseData = {
      fields: extractedFields,
      documentType,
      success: webhookData.success !== false,
      confidence,
      metadata: {
        modelId: analyzeResult?.modelId,
        apiVersion: analyzeResult?.apiVersion,
        documentsCount: analyzeResult?.documentsCount,
        analyzeResult: analyzeResult ?? undefined,
      },
    };

    console.log('[LicenseExtractionService] Parsed result:', result);
    return result;
  },

  /**
   * Convert extracted fields array to form data object
   */
  fieldsToFormData(fields: ExtractedField[]): Record<string, any> {
    if (!fields || !Array.isArray(fields)) {
      return {};
    }

    return fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.value || '',
    }), {});
  },

  /**
   * Validate extracted data
   */
  validateExtractedData(data: ExtractedLicenseData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.success) {
      errors.push('Extraction was not successful');
    }

    if (!data.fields || data.fields.length === 0) {
      errors.push('No fields were extracted from the document');
    }

    if (!data.documentType || data.documentType === 'Unknown') {
      errors.push('Document type could not be determined');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Filter fields by confidence threshold
   */
  filterByConfidence(fields: ExtractedField[], minConfidence: number = 0.5): ExtractedField[] {
    return fields.filter(field => field.confidence >= minConfidence);
  },

  /**
   * Group fields by category
   */
  groupByCategory(fields: ExtractedField[]): Record<string, ExtractedField[]> {
    return fields.reduce((acc, field) => {
      const category = field.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(field);
      return acc;
    }, {} as Record<string, ExtractedField[]>);
  },

  /**
   * Get field statistics
   */
  getFieldStatistics(fields: ExtractedField[]): {
    total: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    averageConfidence: number;
  } {
    if (!fields || fields.length === 0) {
      return {
        total: 0,
        highConfidence: 0,
        mediumConfidence: 0,
        lowConfidence: 0,
        averageConfidence: 0,
      };
    }

    const highConfidence = fields.filter(f => f.confidence >= 0.9).length;
    const mediumConfidence = fields.filter(f => f.confidence >= 0.7 && f.confidence < 0.9).length;
    const lowConfidence = fields.filter(f => f.confidence < 0.7).length;
    const averageConfidence = fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length;

    return {
      total: fields.length,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      averageConfidence,
    };
  },
};
