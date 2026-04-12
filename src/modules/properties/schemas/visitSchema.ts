import { z } from 'zod';

/**
 * Visit creation form validation schema
 */
export const visitSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  notes: z.string().optional(),
});

export type VisitFormValues = z.infer<typeof visitSchema>;

/**
 * Client visit request form validation schema
 */
export const visitRequestSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  preferredDateTime: z.string().min(1, 'Preferred date and time is required'),
  alternativeDateTime: z.string().optional(),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
  clientName: z.string().min(1, 'Name is required'),
  clientEmail: z.string().min(1, 'Email is required').email('Invalid email format'),
  clientPhone: z.string().optional(),
});

export type VisitRequestFormValues = z.infer<typeof visitRequestSchema>;
