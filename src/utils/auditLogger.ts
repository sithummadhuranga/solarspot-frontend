// src/utils/auditLogger.ts
// Production-level audit logger for admin actions

export type AuditLogEntry = {
  timestamp: string;
  userId: string;
  action: string;
  details?: Record<string, any>;
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

  log(userId: string, action: string, details?: Record<string, any>) {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      details,
    };
    this.logs.push(entry);

    // Send to backend API (both dev and production)
    // Fire and forget — don't await or throw errors
    void this.sendToBackend(action, details);

    // Also log to console in dev
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[AUDIT]', entry);
    }
  }

  private async sendToBackend(action: string, details?: Record<string, any>): Promise<void> {
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
        // eslint-disable-next-line no-console
        console.warn(`[AUDIT] Logging failed with status ${response.status}`);
      }
    } catch (error) {
      // Silently fail — audit logging should never break the app
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[AUDIT] Network error:', error instanceof Error ? error.message : error);
      }
    }
  }

  getLogs() {
    return this.logs;
  }
}

export const auditLogger = AuditLogger.getInstance();
