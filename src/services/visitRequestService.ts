// ============================================================
//  src/services/visitRequestService.ts
//  Llamadas a la API para solicitudes de visita de clientes.
//  HU3: cliente buscador solicita agendar una cita.
// ============================================================

import { api } from './api'

import type {
  ClientVisitRequestDTO,
  VisitRequestResponse,
  Property,
} from '../types/visitCalendar'

// ---------------------------------------------------------------
//  HU3 PA1: Obtener propiedades disponibles para el cliente
// ---------------------------------------------------------------

/**
 * Obtiene las propiedades con status "Disponible".
 * El cliente solo debe ver propiedades disponibles (HU3 PA1).
 * Soporta filtros por zona, precio y tipo (HU3 PA3).
 *
 * Llama al property-service existente en el backend.
 */
export async function getAvailableProperties(filters?: {
  zone?: string
  minPrice?: number
  maxPrice?: number
  type?: string
}): Promise<Property[]> {
  const params = new URLSearchParams({ status: 'DISPONIBLE' })
  if (filters?.zone) params.append('zone', filters.zone)
  if (filters?.minPrice !== undefined) params.append('minPrice', String(filters.minPrice))
  if (filters?.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice))
  if (filters?.type) params.append('type', filters.type)

  const response = await api.get(`/properties?${params}`)
  return response.data
}

// ---------------------------------------------------------------
//  HU3 PA2: Solicitar cita → notifica al agente
// ---------------------------------------------------------------

/**
 * El cliente envía una solicitud de visita.
 * El backend notifica automáticamente al agente responsable (HU3 PA2).
 */
export async function createVisitRequest(
  dto: ClientVisitRequestDTO,
): Promise<VisitRequestResponse> {
  const response = await api.post('/api/visit-requests', dto)
  return response.data.data
}

/**
 * El cliente consulta el estado de sus solicitudes enviadas.
 */
export async function getMyVisitRequests(
  clientId: string,
): Promise<VisitRequestResponse[]> {
  const response = await api.get(`/api/visit-requests/client/${clientId}`)
  return response.data.data
}

// ---------------------------------------------------------------
//  Panel del agente: gestionar solicitudes entrantes
// ---------------------------------------------------------------

/**
 * El agente ve sus solicitudes pendientes de clientes.
 */
export async function getPendingRequestsForAgent(
  agentId: string,
): Promise<VisitRequestResponse[]> {
  const response = await api.get(`/api/visit-requests/agent/${agentId}`)
  return response.data.data
}

/**
 * El agente acepta una solicitud → se crea el evento en el calendario.
 */
export async function acceptVisitRequest(
  requestId: string,
  agentId: string,
): Promise<VisitRequestResponse> {
  const response = await api.patch(
    `/api/visit-requests/${requestId}/accept`,
    {},
    { headers: { 'X-Agent-Id': agentId } },
  )
  return response.data.data
}

/**
 * El agente rechaza una solicitud.
 */
export async function rejectVisitRequest(
  requestId: string,
  agentId: string,
): Promise<VisitRequestResponse> {
  const response = await api.patch(
    `/api/visit-requests/${requestId}/reject`,
    {},
    { headers: { 'X-Agent-Id': agentId } },
  )
  return response.data.data
}

// ---------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------

export function formatRequestStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pendiente',
    ACCEPTED: 'Aceptada',
    REJECTED: 'Rechazada',
  }
  return map[status] ?? status
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'yellow',
    ACCEPTED: 'green',
    REJECTED: 'red',
  }
  return map[status] ?? 'gray'
}
