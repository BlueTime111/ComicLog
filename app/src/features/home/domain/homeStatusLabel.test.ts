import assert from 'node:assert/strict';
import test from 'node:test';

import { buildHomeStatusLabel } from './homeStatusLabel';

test('buildHomeStatusLabel 对已同步状态返回中文文案', () => {
  assert.equal(buildHomeStatusLabel('SYNCED'), '已同步');
});

test('buildHomeStatusLabel 对更新状态返回默认中文文案', () => {
  assert.equal(buildHomeStatusLabel('UPDATED'), '有更新');
});

test('buildHomeStatusLabel 对导入更新返回来源文案', () => {
  assert.equal(buildHomeStatusLabel('UPDATED', 'import'), '导入更新');
});

test('buildHomeStatusLabel 对手动编辑更新返回来源文案', () => {
  assert.equal(buildHomeStatusLabel('UPDATED', 'edit'), '手动编辑');
});

test('buildHomeStatusLabel 支持英文导入来源文案', () => {
  assert.equal(buildHomeStatusLabel('UPDATED', 'import', 'en'), 'Imported');
});

test('buildHomeStatusLabel 支持英文同步状态文案', () => {
  assert.equal(buildHomeStatusLabel('SYNCED', undefined, 'en'), 'Synced');
});
