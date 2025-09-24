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
}

const STORAGE_API_BASE_URL = 'https://storage-manager-api-hhfyfdeshhbsedd6.eastus2-01.azurewebsites.net';

export const fileUploadService = {
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

    return {
      url: result.url || result.fileUrl,
      fileName: file.name,
      container: options.container,
      path: options.path,
    };
  },

  async uploadLicenseDocument(
    file: File,
    metadata?: Record<string, any>
  ): Promise<FileUploadResponse> {
    const uploadOptions: FileUploadOptions = {
      container: 'licenses',
      path: 'documents',
      metadata: {
        type: 'license_document',
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    };

    return this.uploadFile(file, uploadOptions);
  },
};