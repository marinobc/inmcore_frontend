/**
 * Properties Module
 *
 * Property management functionality
 */

export { propertyService } from './services/propertyService';
export { documentService } from './services/documentService';
export { imageService } from './services/imageService';

export type { DocumentResponse, GenerateUploadUrlRequest } from './services/documentService';
export type { ImageResponse, ConfirmImageUploadRequest } from './services/imageService';

export { propertySchema, propertyFiltersSchema } from './schemas';
export type { PropertyFormValues, PropertyFiltersValues } from './schemas';
