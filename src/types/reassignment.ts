// src/types/reassignment.ts
// TypeScript types for the Visit Reassignment User Story

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ReassignmentRequest {
  targetAgentId: string;
  reason: string;
}

export interface ReassignmentResponseRequest {
  decision: "ACCEPTED" | "REJECTED";
  comment?: string;
}

export interface ReassignmentSolicitation {
  id: string;
  visitId: string;
  requestingAgentId: string;
  targetAgentId: string;
  reason: string;
  status: RequestStatus;
  requestDate: string;
  responseDate?: string;
  responseComment?: string;
}

export interface PendingCount {
  pending: number;
}

/** Represents an agent available for selection in the reassignment modal */
export interface AvailableAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
