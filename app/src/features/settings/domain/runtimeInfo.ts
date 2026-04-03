import { resolveDataSource, RepositoryDataSource } from '../../../data/repositories/dataSource';
import { AppLocale, resolveAppLocale } from '../../../i18n/locale';

type BuildSettingsRuntimeInfoInput = {
  configuredLocale?: string;
  configuredDataSource?: string;
  runtimeNodeEnv?: string;
  runtimePlatform?: string;
};

export type SettingsRuntimeInfo = {
  locale: AppLocale;
  configuredDataSource: 'mock' | 'sqlite' | 'auto';
  resolvedDataSource: RepositoryDataSource;
  platform: string;
};

const normalizeConfiguredDataSource = (value?: string): 'mock' | 'sqlite' | 'auto' => {
  if (value === 'mock' || value === 'sqlite') {
    return value;
  }

  return 'auto';
};

const normalizeRuntimePlatform = (value?: string): string => {
  const trimmed = value?.trim() ?? '';
  return trimmed || 'unknown';
};

export const buildSettingsRuntimeInfo = (
  input: BuildSettingsRuntimeInfoInput,
): SettingsRuntimeInfo => {
  const platform = normalizeRuntimePlatform(input.runtimePlatform);

  return {
    locale: resolveAppLocale(input.configuredLocale),
    configuredDataSource: normalizeConfiguredDataSource(input.configuredDataSource),
    resolvedDataSource: resolveDataSource(
      input.configuredDataSource,
      input.runtimeNodeEnv ?? '',
      platform === 'unknown' ? '' : platform,
    ),
    platform,
  };
};
