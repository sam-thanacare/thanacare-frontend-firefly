/**
 * Debug Logger Utility
 * Provides structured logging for troubleshooting document loading issues
 * Controlled by environment variables and feature flags
 */

import { debugConfig, shouldLog } from '@/lib/config/debug';

export interface DebugLogEntry {
  timestamp: string;
  component: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
}

class DebugLogger {
  private logs: DebugLogEntry[] = [];
  private maxLogs = debugConfig.maxStorageLogs;

  log(
    component: string,
    level: DebugLogEntry['level'],
    message: string,
    data?: unknown
  ) {
    // Check if logging is enabled for this component and level
    if (!shouldLog(level, component)) {
      return;
    }

    const entry: DebugLogEntry = {
      timestamp: new Date().toISOString(),
      component,
      level,
      message,
      data,
    };

    // Store logs if enabled
    if (debugConfig.logToStorage) {
      this.logs.push(entry);

      // Keep only the last maxLogs entries
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }
    }

    // Log to console if enabled
    if (debugConfig.logToConsole) {
      const emoji = this.getEmoji(level);
      const consoleMessage = `${emoji} ${component}: ${message}`;

      switch (level) {
        case 'error':
          console.error(consoleMessage, data);
          break;
        case 'warn':
          console.warn(consoleMessage, data);
          break;
        case 'debug':
          console.debug(consoleMessage, data);
          break;
        default:
          console.log(consoleMessage, data);
      }
    }
  }

  private getEmoji(level: DebugLogEntry['level']): string {
    switch (level) {
      case 'debug':
        return '🐛';
      case 'info':
        return '🔄';
      case 'warn':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  }

  getLogs(): DebugLogEntry[] {
    return [...this.logs];
  }

  getLogsByComponent(component: string): DebugLogEntry[] {
    return this.logs.filter((log) => log.component === component);
  }

  getLogsByLevel(level: DebugLogEntry['level']): DebugLogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Convenience methods for common logging patterns
  debug(component: string, message: string, data?: unknown) {
    this.log(component, 'debug', message, data);
  }

  info(component: string, message: string, data?: unknown) {
    this.log(component, 'info', message, data);
  }

  warn(component: string, message: string, data?: unknown) {
    this.log(component, 'warn', message, data);
  }

  error(component: string, message: string, data?: unknown) {
    this.log(component, 'error', message, data);
  }

  // API call logging
  logApiCall(
    url: string,
    method: string,
    headers?: Record<string, string>,
    body?: unknown
  ) {
    this.info('API', `Making ${method} request to ${url}`, {
      url,
      method,
      headers: headers
        ? Object.keys(headers).reduce(
            (acc, key) => {
              acc[key] = key === 'Authorization' ? 'Bearer ***' : headers[key];
              return acc;
            },
            {} as Record<string, string>
          )
        : undefined,
      body,
    });
  }

  logApiResponse(url: string, status: number, response: unknown) {
    if (status >= 200 && status < 300) {
      this.info(
        'API',
        `Request to ${url} succeeded with status ${status}`,
        response
      );
    } else {
      this.error(
        'API',
        `Request to ${url} failed with status ${status}`,
        response
      );
    }
  }

  logApiError(url: string, error: Error) {
    this.error('API', `Request to ${url} failed with error`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  }

  // Navigation logging
  logNavigation(from: string, to: string, data?: unknown) {
    this.info('Navigation', `Navigating from ${from} to ${to}`, data);
  }

  // State logging
  logStateChange(
    component: string,
    stateName: string,
    oldValue: unknown,
    newValue: unknown
  ) {
    this.info(component, `State change: ${stateName}`, {
      oldValue,
      newValue,
    });
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).debugLogger = debugLogger;
}

export default debugLogger;
