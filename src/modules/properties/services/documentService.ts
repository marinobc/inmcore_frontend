import { apiClient as api } from '@/core/api';

export interface DocumentResponse {
  id: string;
  documentType: string;
  originalFileName: string;
  objectKey: string;
  publicUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REJECTED';
  accessPolicy: string[];
  validUntil?: string;
  temporaryDownloadUrl?: string;
  expiresInSeconds: number;
}

export interface GenerateUploadUrlRequest {
  propertyId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
}

export const documentService = {
  async generateDocumentUploadUrl(request: GenerateUploadUrlRequest): Promise<{
    uploadUrl: string;
    objectKey: string;
    publicUrl: string;
    expiresInSeconds: string;
  }> {
    const response = await api.post('/documents/upload-url', request);
    return response.data.data;
  },

  async confirmDocumentUpload(
    propertyId: string,
    documentType: string,
    objectKey: string,
    originalFileName: string,
    fileSize?: number,
    mimeType?: string
  ): Promise<DocumentResponse> {
    const response = await api.post('/documents/confirm', {
      propertyId,
      documentType,
      objectKey,
      originalFileName,
      fileSize,
      mimeType,
    });
    return response.data.data;
  },

  async getPropertyDocuments(propertyId: string): Promise<DocumentResponse[]> {
    const response = await api.get(`/documents/property/${propertyId}`);
    return response.data.data;
  },

  async updateDocumentPermissions(
    documentId: string,
    accessPolicy: string[]
  ): Promise<DocumentResponse> {
    const response = await api.patch(`/documents/${documentId}/permissions`, {
      documentId,
      accessPolicy,
    });
    return response.data.data;
  },

  async refreshDownloadUrl(
    documentId: string
  ): Promise<{ temporaryDownloadUrl: string; expiresInSeconds: string }> {
    const response = await api.post(`/documents/${documentId}/refresh-url`);
    return response.data.data;
  },

  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  },

  async uploadExclusivityContract(propertyId: string, file: File): Promise<DocumentResponse> {
    const { uploadUrl, objectKey } = await this.generateDocumentUploadUrl({
      propertyId,
      documentType: 'EXCLUSIVITY_CONTRACT',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Error uploading file: ${uploadResponse.statusText}`);
    }

    return await this.confirmDocumentUpload(
      propertyId,
      'EXCLUSIVITY_CONTRACT',
      objectKey,
      file.name,
      file.size,
      file.type
    );
  },
};
