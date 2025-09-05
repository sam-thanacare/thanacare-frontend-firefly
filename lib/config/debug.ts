/**
 * Debug Configuration
 * Controls debug logging behavior based on environment variables
 */

export interface DebugConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  logToConsole: boolean;
  logToStorage: boolean;
  maxStorageLogs: number;
  components: {
    MemberDashboard: boolean;
    DocumentDetailPage: boolean;
    DementiaValuesForm: boolean;
    API: boolean;
    Navigation: boolean;
    State: boolean;
  };
}

const getDebugConfig = (): DebugConfig => {
  // Check if debug is enabled via environment variable
  const debugEnabled = process.env.NEXT_PUBLIC_DEBUG_ENABLED === 'true';
  const debugLevel =
    (process.env.NEXT_PUBLIC_DEBUG_LEVEL as DebugConfig['logLevel']) || 'info';
  const logToConsole = process.env.NEXT_PUBLIC_DEBUG_CONSOLE !== 'false';
  const logToStorage = process.env.NEXT_PUBLIC_DEBUG_STORAGE === 'true';
  const maxStorageLogs = parseInt(
    process.env.NEXT_PUBLIC_DEBUG_MAX_LOGS || '100',
    10
  );

  // Component-specific flags
  const components = {
    MemberDashboard: process.env.NEXT_PUBLIC_DEBUG_MEMBER_DASHBOARD !== 'false',
    DocumentDetailPage:
      process.env.NEXT_PUBLIC_DEBUG_DOCUMENT_DETAIL !== 'false',
    DementiaValuesForm: process.env.NEXT_PUBLIC_DEBUG_DEMENTIA_FORM !== 'false',
    API: process.env.NEXT_PUBLIC_DEBUG_API !== 'false',
    Navigation: process.env.NEXT_PUBLIC_DEBUG_NAVIGATION !== 'false',
    State: process.env.NEXT_PUBLIC_DEBUG_STATE !== 'false',
  };

  return {
    enabled: debugEnabled,
    logLevel: debugLevel,
    logToConsole,
    logToStorage,
    maxStorageLogs,
    components,
  };
};

export const debugConfig = getDebugConfig();

// Log level hierarchy for filtering
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
} as const;

export const shouldLog = (
  level: keyof typeof LOG_LEVELS,
  component?: string
): boolean => {
  if (!debugConfig.enabled) return false;

  // Check component-specific flag
  if (
    component &&
    debugConfig.components[component as keyof DebugConfig['components']] ===
      false
  ) {
    return false;
  }

  // Check log level
  return LOG_LEVELS[level] >= LOG_LEVELS[debugConfig.logLevel];
};

export const isDebugEnabled = (): boolean => debugConfig.enabled;

export const isComponentDebugEnabled = (component: string): boolean => {
  return (
    debugConfig.enabled &&
    debugConfig.components[component as keyof DebugConfig['components']] !==
      false
  );
};

// Development mode check
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// Production mode check
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

// Debug mode check (overrides production for debugging)
export const isDebugMode = (): boolean => {
  return debugConfig.enabled || isDevelopment();
};
