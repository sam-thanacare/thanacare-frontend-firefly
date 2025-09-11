/**
 * Feature Flags Configuration
 * Controls feature availability based on environment variables
 */

export interface FeaturesConfig {
  autoSaveEnabled: boolean;
}

const getFeaturesConfig = (): FeaturesConfig => {
  // Check if auto-save is enabled via environment variable
  const autoSaveEnabled = process.env.NEXT_PUBLIC_AUTO_SAVE_ENABLED !== 'false';

  return {
    autoSaveEnabled,
  };
};

export const featuresConfig = getFeaturesConfig();

// Feature flag checks
export const isAutoSaveEnabled = (): boolean => featuresConfig.autoSaveEnabled;
