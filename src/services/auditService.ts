import { api } from './api'

export const auditService = {
  async getLogs() {
    const [identityResult, personResult] = await Promise.allSettled([
      api.get('/audit/logs'),
      api.get('/audit-logs')
    ])

    const normalizeIdentityAction = (action: string) => {
      const map: Record<string, string> = {
        USER_CREATE: 'CREATED',
        USER_UPDATE: 'UPDATED',
        USER_DEACTIVATE: 'DEACTIVATE',
        USER_REACTIVATE: 'REACTIVATE',
        USER_DELETE: 'DELETE',
        USER_ROLE_ASSIGN: 'ROLE_ASSIGN'
      }
      return map[action] || action
    }

    const extractEmailFromDetails = (details?: string): string | undefined => {
      if (!details) return undefined
      const match = details.match(/User:\s*([^\s]+)\s*\(/i)
      return match?.[1]
    }

    const rawIdentityLogs = identityResult.status === 'fulfilled'
      ? (identityResult.value.data || [])
      : []

    const userLabelById = new Map<string, string>()

    // Recorremos por antiguedad para conservar el ultimo nombre/email conocido.
    rawIdentityLogs
      .slice()
      .sort((a: any, b: any) => {
        const ta = new Date(a.timestamp || 0).getTime()
        const tb = new Date(b.timestamp || 0).getTime()
        return ta - tb
      })
      .forEach((log: any) => {
        const uid = (log.userId || '').toString().trim()
        if (!uid) return

        const label = log.userEmail || extractEmailFromDetails(log.details)
        if (label) {
          userLabelById.set(uid, label)
        }
      })

    const identityLogs = rawIdentityLogs.map((log: any) => ({
      id: `identity-${log.id}`,
      action: normalizeIdentityAction(log.action),
      personId: log.userId,
      personName:
        log.userEmail ||
        extractEmailFromDetails(log.details) ||
        userLabelById.get((log.userId || '').toString()) ||
        log.userId ||
        'Usuario',
      personType: 'USER',
      changedBy: log.performedByName || log.performedByEmail || log.performedBy || 'Usuario no identificado',
      timestamp: log.timestamp,
      details: log.details,
      changes: []
    }))

    const personLogs = personResult.status === 'fulfilled'
      ? (personResult.value.data || [])
      : []

    return [...identityLogs, ...personLogs].sort((a: any, b: any) => {
      const ta = new Date(a.timestamp || 0).getTime()
      const tb = new Date(b.timestamp || 0).getTime()
      return tb - ta
    })
  }
}