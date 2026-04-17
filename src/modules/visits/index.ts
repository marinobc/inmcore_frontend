/**
 * Visits Module
 *
 * Calendar, Scheduling and Reassignments
 */

export * from './services/calendarService';
export * from './services/visitRequestService';
export { reassignmentService } from './services/reassignmentService';

export { useReassignment } from './composables/useReassignment';

export { visitSchema, visitRequestSchema } from './schemas';
export type { VisitFormValues, VisitRequestFormValues } from './schemas';

export type {
  EventType,
  EventStatus,
  RequestStatus,
  CalendarEventResponse,
  CalendarResponse,
  ConflictResponse,
  CreateVisitRequest,
  ClientVisitRequestDTO,
  VisitRequestResponse,
  Property,
  CalendarDay,
  WeekRange,
} from './types/visitCalendar';

export type {
  ReassignmentRequest,
  ReassignmentResponseRequest,
  ReassignmentSolicitation,
  PendingCount,
  AvailableAgent,
} from './types/reassignment';
