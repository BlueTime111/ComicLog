import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldRenderImportTitle } from './importScreenLayout';

test('shouldRenderImportTitle 在空标题时返回 false', () => {
  assert.equal(shouldRenderImportTitle(''), false);
});

test('shouldRenderImportTitle 在仅空白标题时返回 false', () => {
  assert.equal(shouldRenderImportTitle('   '), false);
});

test('shouldRenderImportTitle 在非空标题时返回 true', () => {
  assert.equal(shouldRenderImportTitle('导入'), true);
});
