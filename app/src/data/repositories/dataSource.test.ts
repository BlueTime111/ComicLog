import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveDataSource, shouldFallbackToMockOnRepositoryError } from './dataSource';

test('resolveDataSource 显式为 mock 时返回 mock', () => {
  const source = resolveDataSource('mock', 'development');
  assert.equal(source, 'mock');
});

test('resolveDataSource 显式为 sqlite 时返回 sqlite', () => {
  const source = resolveDataSource('sqlite', 'development');
  assert.equal(source, 'sqlite');
});

test('resolveDataSource 在测试环境默认使用 mock', () => {
  const source = resolveDataSource(undefined, 'test', 'ios');
  assert.equal(source, 'mock');
});

test('resolveDataSource 在非测试环境默认使用 sqlite', () => {
  const source = resolveDataSource(undefined, 'development', 'ios');
  assert.equal(source, 'sqlite');
});

test('resolveDataSource 在 web 平台默认使用 mock', () => {
  const source = resolveDataSource(undefined, 'development', 'web');
  assert.equal(source, 'mock');
});

test('shouldFallbackToMockOnRepositoryError 在原生 sqlite 模式返回 false', () => {
  const result = shouldFallbackToMockOnRepositoryError('sqlite', 'ios');
  assert.equal(result, false);
});

test('shouldFallbackToMockOnRepositoryError 对 mock 返回 true', () => {
  const result = shouldFallbackToMockOnRepositoryError('mock', 'ios');
  assert.equal(result, true);
});

test('shouldFallbackToMockOnRepositoryError 在 web sqlite 模式返回 true', () => {
  const result = shouldFallbackToMockOnRepositoryError('sqlite', 'web');
  assert.equal(result, true);
});
