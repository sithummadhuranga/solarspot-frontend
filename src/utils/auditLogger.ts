
export type AuditLogEntry = {
  timestamp: string;
  userId: string;
  action: string;
  details?: Record<string, unknown>;
};

export class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLogEntry[] = [];

  private constructor() {}

  static getInstance() {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  log(userId: string, action: string, details?: Record<string, unknown>) {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      details,
    };
    this.logs.push(entry);

    void this.sendToBackend(action, details);

    if (import.meta.env.DEV) {
      console.info('[AUDIT]', entry)
    }
  }

  private async sendToBackend(action: string, details?: Record<string, unknown>): Promise<void> {
    try {
      const response = await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, details }),
        credentials: 'include', // Send cookies/auth with request
      });

      if (!response.ok && import.meta.env.DEV) {
        console.warn(`[AUDIT] Logging failed with status ${response.status}`)
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[AUDIT] Network error:', error instanceof Error ? error.message : error)
      }
    }
  }

  getLogs() {
    return this.logs;
  }
}

export const auditLogger = AuditLogger.getInstance();
