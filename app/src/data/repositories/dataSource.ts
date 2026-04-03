export type RepositoryDataSource = 'mock' | 'sqlite';

export const resolveDataSource = (
  configuredValue: string | undefined,
  runtimeNodeEnv: string = process.env.NODE_ENV ?? '',
  runtimePlatform: string = process.env.EXPO_OS ?? '',
): RepositoryDataSource => {
  if (configuredValue === 'mock' || configuredValue === 'sqlite') {
    return configuredValue;
  }

  if (runtimePlatform === 'web') {
    return 'mock';
  }

  if (runtimeNodeEnv === 'test') {
    return 'mock';
  }

  return 'sqlite';
};

export const shouldFallbackToMockOnRepositoryError = (
  source: RepositoryDataSource,
  runtimePlatform: string = process.env.EXPO_OS ?? '',
): boolean => {
  if (source === 'mock') {
    return true;
  }

  return runtimePlatform === 'web';
};
