import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSettingsRuntimeInfo } from './runtimeInfo';

test('buildSettingsRuntimeInfo 在显式配置时返回配置值和解析值', () => {
  const info = buildSettingsRuntimeInfo({
    configuredLocale: 'en',
    configuredDataSource: 'sqlite',
    runtimeNodeEnv: 'development',
    runtimePlatform: 'ios',
  });

  assert.equal(info.locale, 'en');
  assert.equal(info.configuredDataSource, 'sqlite');
  assert.equal(info.resolvedDataSource, 'sqlite');
  assert.equal(info.platform, 'ios');
});

test('buildSettingsRuntimeInfo 在未配置数据源时返回 auto 并按运行时推导', () => {
  const info = buildSettingsRuntimeInfo({
    configuredLocale: undefined,
    configuredDataSource: undefined,
    runtimeNodeEnv: 'development',
    runtimePlatform: 'web',
  });

  assert.equal(info.locale, 'zh-CN');
  assert.equal(info.configuredDataSource, 'auto');
  assert.equal(info.resolvedDataSource, 'mock');
  assert.equal(info.platform, 'web');
});

test('buildSettingsRuntimeInfo 对未知平台和非法数据源显示兜底值', () => {
  const info = buildSettingsRuntimeInfo({
    configuredLocale: 'fr',
    configuredDataSource: 'memory',
    runtimeNodeEnv: 'test',
    runtimePlatform: '   ',
  });

  assert.equal(info.locale, 'zh-CN');
  assert.equal(info.configuredDataSource, 'auto');
  assert.equal(info.resolvedDataSource, 'mock');
  assert.equal(info.platform, 'unknown');
});
