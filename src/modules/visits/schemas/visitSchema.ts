import { z } from 'zod';
import i18n from '@/core/locales/i18n';

const { t } = i18n.global;

/**
 * Visit creation form validation schema
 */
export const visitSchema = z
  .object({
    propertyId: z.string().min(1, t('validation.propertyRequired')),
    startTime: z.string().min(1, t('validation.startTimeRequired')),
    endTime: z.string().min(1, t('validation.endTimeRequired')),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return new Date(data.startTime) < new Date(data.endTime);
    },
    {
      message: t('validation.startBeforeEnd'),
      path: ['endTime'],
    }
  );

export type VisitFormValues = z.infer<typeof visitSchema>;

/**
 * Client visit request form validation schema
 */
export const visitRequestSchema = z.object({
  propertyId: z.string().min(1, t('validation.propertyRequired')),
  preferredDateTime: z.string().min(1, t('validation.preferredDateTimeRequired')),
  alternativeDateTime: z.string().optional(),
  message: z.string().max(500, t('validation.messageTooLong')).optional(),
  clientName: z.string().min(1, t('validation.nameRequired')),
  clientEmail: z.string().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid')),
  clientPhone: z.string().optional(),
});

export type VisitRequestFormValues = z.infer<typeof visitRequestSchema>;
