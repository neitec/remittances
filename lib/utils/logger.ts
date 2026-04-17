/**
 * Structured logging utilities for remittances API calls
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  action: string;
  data?: Record<string, unknown>;
  error?: string;
}

function log(entry: LogEntry) {
  const isDev = process.env.NODE_ENV === "development";
  const logData = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  if (isDev) {
    // In development, use console
    const prefix = `[${entry.service}] ${entry.action}`;
    switch (entry.level) {
      case "debug":
        console.debug(prefix, logData.data || "");
        break;
      case "info":
        console.info(prefix, logData.data || "");
        break;
      case "warn":
        console.warn(prefix, logData.data || "");
        break;
      case "error":
        console.error(prefix, logData.error, logData.data || "");
        break;
    }
  }

  // In production, could send to external logging service
  // Example: sendToLoggingService(logData);
}

export const logger = {
  debug: (service: string, action: string, data?: Record<string, unknown>) =>
    log({ level: "debug", service, action, data }),

  info: (service: string, action: string, data?: Record<string, unknown>) =>
    log({ level: "info", service, action, data }),

  warn: (service: string, action: string, data?: Record<string, unknown>) =>
    log({ level: "warn", service, action, data }),

  error: (
    service: string,
    action: string,
    error: string | Error,
    data?: Record<string, unknown>
  ) =>
    log({
      level: "error",
      service,
      action,
      error: error instanceof Error ? error.message : error,
      data,
    }),

  // Specialized loggers for common operations
  apiCall: (method: string, endpoint: string, data?: unknown) =>
    log({
      level: "debug",
      service: "API",
      action: `${method} ${endpoint}`,
      data: data ? { payload: data } : undefined,
    }),

  apiError: (
    method: string,
    endpoint: string,
    status: number,
    error: string
  ) =>
    log({
      level: "error",
      service: "API",
      action: `${method} ${endpoint}`,
      error: `HTTP ${status}: ${error}`,
    }),

  paymentProvider: (action: string, data?: Record<string, unknown>) =>
    log({
      level: "info",
      service: "PaymentProvider",
      action,
      data,
    }),
};
