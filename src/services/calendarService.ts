// ============================================================
//  src/services/calendarService.ts
//  Llamadas a la API del visit-calendar-service.
//  HU1: calendario compartido | HU2: programar visita
// ============================================================

import type {
  ApiResponse,
  CalendarResponse,
  CalendarEventResponse,
  ConflictResponse,
  CreateVisitRequest,
} from '../types/visitCalendar'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Devuelve los headers comunes para todas las peticiones.
 * X-Agent-Id se usa para marcar los eventos propios del agente (HU1 PA1).
 */
function getHeaders(agentId?: string): HeadersInit {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(agentId ? { 'X-Agent-Id': agentId } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body: ApiResponse<T> = await res.json()
  if (!res.ok || !body.success) {
    throw new Error(body.message || `Error HTTP ${res.status}`)
  }
  return body.data
}

// ---------------------------------------------------------------
//  HU1: GET /api/calendar
//  Visualizar el calendario compartido del equipo
// ---------------------------------------------------------------

/**
 * Obtiene el calendario del equipo en un rango de fechas.
 * @param from         - inicio del rango (ISO string)
 * @param to           - fin del rango (ISO string)
 * @param agentId      - filtro opcional por agente
 * @param propertyId   - filtro opcional por propiedad (HU1 PA3)
 * @param myAgentId    - ID del agente autenticado (para marcar ownEvent, HU1 PA1)
 */
export async function getCalendar(
  from: string,
  to: string,
  myAgentId?: string,
  agentId?: string,
  propertyId?: string,
): Promise<CalendarResponse> {
  const params = new URLSearchParams({ from, to })
  if (agentId) params.append('agentId', agentId)
  if (propertyId) params.append('propertyId', propertyId)

  const res = await fetch(`${BASE_URL}/api/calendar?${params}`, {
    headers: getHeaders(myAgentId),
  })
  return handleResponse<CalendarResponse>(res)
}

// ---------------------------------------------------------------
//  HU2: Programar visita
// ---------------------------------------------------------------

/**
 * Verifica si hay conflicto de horario ANTES de crear el evento.
 * Permite alertar al usuario sin guardar nada (HU2 PA2 + HU1 PA2).
 */
export async function checkConflict(
  propertyId: string,
  startTime: string,
  endTime: string,
): Promise<ConflictResponse> {
  const params = new URLSearchParams({ propertyId, startTime, endTime })
  const res = await fetch(`${BASE_URL}/api/visits/conflict-check?${params}`, {
    headers: getHeaders(),
  })
  return handleResponse<ConflictResponse>(res)
}

/**
 * Crea una visita en el calendario.
 * Lanza error si hay conflicto de horario (409 Conflict del backend).
 * La visita aparece automáticamente en el calendario compartido (HU2 PA1).
 */
export async function createVisit(
  data: CreateVisitRequest,
  agentId: string,
): Promise<CalendarEventResponse> {
  const res = await fetch(`${BASE_URL}/api/visits`, {
    method: 'POST',
    headers: getHeaders(agentId),
    body: JSON.stringify(data),
  })
  return handleResponse<CalendarEventResponse>(res)
}

/**
 * Obtiene la agenda del día de un agente (HU2 PA3).
 * @param agentId - ID del agente
 * @param day     - cualquier datetime del día a consultar (ISO string)
 */
export async function getDayAgenda(
  agentId: string,
  day: string,
): Promise<CalendarEventResponse[]> {
  const params = new URLSearchParams({ agentId, day })
  const res = await fetch(`${BASE_URL}/api/visits/agenda?${params}`, {
    headers: getHeaders(agentId),
  })
  return handleResponse<CalendarEventResponse[]>(res)
}

/**
 * Cancela una visita (solo el agente dueño puede cancelar la suya).
 */
export async function cancelVisit(
  visitId: string,
  agentId: string,
): Promise<CalendarEventResponse> {
  const res = await fetch(`${BASE_URL}/api/visits/${visitId}/cancel`, {
    method: 'PATCH',
    headers: getHeaders(agentId),
  })
  return handleResponse<CalendarEventResponse>(res)
}

// ---------------------------------------------------------------
//  Helpers de fecha para el calendario visual
// ---------------------------------------------------------------

/** Devuelve el inicio y fin de la semana que contiene la fecha dada */
export function getWeekRange(date: Date): { from: string; to: string } {
  const day = date.getDay()
  const diffToMonday = (day === 0 ? -6 : 1 - day)
  const monday = new Date(date)
  monday.setDate(date.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return {
    from: monday.toISOString(),
    to: sunday.toISOString(),
  }
}

/** Formatea un datetime ISO a "Lun 2 Jun, 10:00" */
export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Convierte un ISO string a input[type=datetime-local] value */
export function isoToDatetimeLocal(iso: string): string {
  return iso.slice(0, 16)
}

/** Convierte un input[type=datetime-local] value a ISO string */
export function datetimeLocalToIso(val: string): string {
  return new Date(val).toISOString()
}
