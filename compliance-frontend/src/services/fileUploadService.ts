export interface FileUploadOptions {
  container: string;
  path: string;
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  url: string;
  fileName: string;
  container: string;
  path: string;
  webhookResponse?: any;
}

const STORAGE_API_BASE_URL = 'https://storage-manager-api-hhfyfdeshhbsedd6.eastus2-01.azurewebsites.net';
const COMPLIANCE_WEBHOOK_URL = 'https://compliance-logic-app-gfa0d4g0gmfvgraw.eastus2-01.azurewebsites.net:443/api/compliance-storage-documents/triggers/get_document_path/invoke?api-version=2022-05-01&sp=%2Ftriggers%2Fget_document_path%2Frun&sv=1.0&sig=iVlipyIURQADznd7Ux9xW8vgjr5P2-3BN-kC0x3ZFvQ';

export const fileUploadService = {
  async notifyComplianceWebhook(blobUrl: string): Promise<any> {
    try {
      // Extract path from full blob URL and normalize it
      const url = new URL(blobUrl);
      let blobPath = url.pathname;

      // Remove leading "/" and decode URL-encoded characters
      if (blobPath.startsWith('/')) {
        blobPath = blobPath.substring(1);
      }
      blobPath = decodeURIComponent(blobPath);

      const response = await fetch(COMPLIANCE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobUrl: blobPath
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to notify compliance webhook:', response.status, response.statusText, errorText);
        return { error: `Webhook failed: ${response.status} ${response.statusText}` };
      }

      const webhookResponse = await response.json();
      console.log('Webhook response:', webhookResponse);
      return webhookResponse;
    } catch (error) {
      console.error('Error notifying compliance webhook:', error);
      return { error: error };
    }
  },

  async uploadFile(
    file: File,
    options: FileUploadOptions
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    const requestId = crypto.randomUUID();

    formData.append('file', file);
    formData.append('container', options.container);
    formData.append('path', options.path);

    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    const response = await fetch(`${STORAGE_API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      headers: {
        'x-request-id': requestId,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    const documentUrl = result.data?.url || result.url || result.fileUrl;

    const uploadResponse = {
      url: documentUrl,
      fileName: file.name,
      container: options.container,
      path: options.path,
    };

    const webhookResponse = await this.notifyComplianceWebhook(documentUrl);

    return {
      ...uploadResponse,
      webhookResponse
    };
  },

  async uploadLicenseDocument(
    file: File,
    metadata?: Record<string, any>
  ): Promise<FileUploadResponse> {
    const uploadOptions: FileUploadOptions = {
      container: 'compliance',
      path: 'temp',
      metadata: {
        type: 'license_document',
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    };

    return this.uploadFile(file, uploadOptions);
  },
};