// src/services/reassignmentService.ts
// Consumes the reassignment endpoints from the visit-calendar-service.
// Uses the shared axios instance (with auth interceptor) from the project.

import { api } from "./api"; // existing axios instance with JWT interceptor + baseURL
import type {
  ReassignmentSolicitation,
  ReassignmentRequest,
  ReassignmentResponseRequest,
  PendingCount,
  AvailableAgent,
} from "../types/reassignment";

const BASE = "/api";

const reassignmentService = {
  /**
   * POST /api/visits/{visitId}/reassignment
   * Request the reassignment of one of the agent's own visits.
   */
  async requestReassignment(
    visitId: string,
    payload: ReassignmentRequest,
  ): Promise<ReassignmentSolicitation> {
    const { data } = await api.post<ReassignmentSolicitation>(
      `${BASE}/visits/${visitId}/reassignment`,
      payload,
    );
    return data;
  },

  /**
   * PUT /api/reassignments/{requestId}/reply
   * Accept or reject a received reassignment request.
   */
  async respondToRequest(
    requestId: string,
    payload: ReassignmentResponseRequest,
  ): Promise<ReassignmentSolicitation> {
    const { data } = await api.put<ReassignmentSolicitation>(
      `${BASE}/reassignments/${requestId}/reply`,
      payload,
    );
    return data;
  },

  /**
   * GET /api/reassignments/received
   * Get all PENDING reassignment requests received by the authenticated agent.
   */
  async getReceivedRequests(): Promise<ReassignmentSolicitation[]> {
    const { data } = await api.get<ReassignmentSolicitation[]>(
      `${BASE}/reassignments/received`,
    );
    return data;
  },

  /**
   * GET /api/reassignments/pending/count
   * Get the number of pending requests (used for the menu badge).
   */
  async getPendingCount(): Promise<number> {
    const { data } = await api.get<PendingCount>(
      `${BASE}/reassignments/pending/count`,
    );
    return data.pending;
  },

  /**
   * GET /users?role=AGENT
   * Get the list of available agents for the target selector.
   * Adjust the endpoint to match your user-service implementation.
   */
  async getAvailableAgents(): Promise<AvailableAgent[]> {
    const { data } = await api.get<AvailableAgent[]>("/users", {
      params: { role: "AGENT" },
    });
    return data;
  },
};

export default reassignmentService;
