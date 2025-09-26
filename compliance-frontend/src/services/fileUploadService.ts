import apiClient from '../middleware/apiClient';

export interface FileUploadResponse {
  success: boolean;
  data: {
    fileName: string;
    filePath: string;
    fileUrl: string;
    contentType: string;
    size: number;
  };
  meta: {
    traceId: string;
  };
  webhookResponse?: any;
}

const COMPLIANCE_WEBHOOK_URL = 'https://compliance-logic-app-gfa0d4g0gmfvgraw.eastus2-01.azurewebsites.net:443/api/compliance-storage-documents/triggers/get_document_path/invoke?api-version=2022-05-01&sp=%2Ftriggers%2Fget_document_path%2Frun&sv=1.0&sig=iVlipyIURQADznd7Ux9xW8vgjr5P2-3BN-kC0x3ZFvQ';

export const fileUploadService = {
  async notifyComplianceWebhook(filePath: string): Promise<any> {
    try {
      console.log('[File Upload] notifyComplianceWebhook called with:', filePath);

      if (!filePath) {
        console.error('[File Upload] filePath is null or undefined');
        return { error: 'File path is required for webhook notification' };
      }

      // Normalize the file path - ensure it follows the format: compliance/temp/filename.pdf
      let normalizedPath = filePath;

      // If it's a full URL, extract the path
      if (filePath.startsWith('http')) {
        const url = new URL(filePath);
        normalizedPath = url.pathname;
        // Remove leading "/" if present
        if (normalizedPath.startsWith('/')) {
          normalizedPath = normalizedPath.substring(1);
        }
      }

      // Decode URL-encoded characters
      normalizedPath = decodeURIComponent(normalizedPath);

      // Ensure it starts with compliance/temp/ if not already formatted
      if (!normalizedPath.startsWith('compliance/temp/')) {
        // Extract just the filename if it's a different path
        const fileName = normalizedPath.split('/').pop() || normalizedPath;
        normalizedPath = `compliance/temp/${fileName}`;
      }

      console.log(`[File Upload] Notifying webhook with path: ${normalizedPath}`);

      const response = await fetch(COMPLIANCE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobUrl: normalizedPath
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[File Upload] Webhook failed:', response.status, response.statusText, errorText);
        return { error: `Webhook failed: ${response.status} ${response.statusText}` };
      }

      const webhookResponse = await response.json();
      console.log('[File Upload] Webhook response:', webhookResponse);
      return webhookResponse;
    } catch (error) {
      console.error('[File Upload] Error notifying compliance webhook:', error);
      return { error: error };
    }
  },

  async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      console.log('[File Upload] Starting file upload for:', file.name);

      // Use the centralized API client for file upload
      const response = await apiClient.uploadFile('/files/temp-upload', file);

      console.log('[File Upload] API response:', response);
      console.log('[File Upload] Response data:', response.data);

      const uploadResult = response.data;
      console.log('[File Upload] Upload result:', uploadResult);

      // The API now returns JSON directly with the license data
      // No need to extract URL and call webhook - the response IS the webhook response
      console.log('[File Upload] Processing JSON response directly');

      return {
        success: true,
        data: {
          fileName: file.name,
          filePath: `temp/${file.name}`,
          fileUrl: `temp/${file.name}`,
          contentType: file.type,
          size: file.size,
        },
        meta: {
          traceId: 'direct-upload',
        },
        webhookResponse: uploadResult // The upload result IS the webhook response
      };
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  },

  async uploadLicenseDocument(file: File): Promise<FileUploadResponse> {
    return this.uploadFile(file);
  },
};