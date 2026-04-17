import { apiClient as api } from '@/core/api';
import type { Property } from '@/modules/properties/types/property';

export interface ImageResponse {
  id: string;
  originalFileName: string;
  objectKey: string;
  publicUrl: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isPrimary: boolean;
  displayOrder: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  status: string;
  accessPolicy: string[];
  temporaryDownloadUrl?: string;
  expiresInSeconds: number;
}

export interface ConfirmImageUploadRequest {
  objectKey: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  isPrimary?: boolean;
}

export const imageService = {
  async generateImageUploadUrl(
    propertyId: string,
    file: File
  ): Promise<{ uploadUrl: string; publicUrl: string; objectKey: string }> {
    const response = await api.post(`/properties/${propertyId}/images/upload-url`, {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
    return response.data.data;
  },

  async confirmImageUpload(
    propertyId: string,
    payload: ConfirmImageUploadRequest
  ): Promise<Property> {
    const response = await api.post(`/properties/${propertyId}/images/confirm`, payload);
    return response.data.data;
  },

  async getPropertyImages(propertyId: string): Promise<ImageResponse[]> {
    const response = await api.get(`/properties/${propertyId}/images`);
    return response.data.data;
  },

  async deleteImage(propertyId: string, imageId: string): Promise<void> {
    await api.delete(`/properties/${propertyId}/images/${imageId}`);
  },

  async reorderImages(propertyId: string, orderedImageIds: string[]): Promise<ImageResponse[]> {
    const response = await api.post(`/properties/${propertyId}/images/reorder`, orderedImageIds);
    return response.data.data;
  },
};
