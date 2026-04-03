import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveAppLocale } from './locale';

test('resolveAppLocale 对 en 返回英文 locale', () => {
  assert.equal(resolveAppLocale('en'), 'en');
});

test('resolveAppLocale 对 zh-CN 返回中文 locale', () => {
  assert.equal(resolveAppLocale('zh-CN'), 'zh-CN');
});

test('resolveAppLocale 对未知值回退中文 locale', () => {
  assert.equal(resolveAppLocale('jp'), 'zh-CN');
});
