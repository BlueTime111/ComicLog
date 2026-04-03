import assert from 'node:assert/strict';
import test from 'node:test';

import { buildHomeCardSummary } from './homeCardSummary';

test('buildHomeCardSummary 在摘要为空时返回 null', () => {
  assert.equal(buildHomeCardSummary(''), null);
  assert.equal(buildHomeCardSummary('   '), null);
});

test('buildHomeCardSummary 在摘要有值时添加引号展示', () => {
  assert.equal(buildHomeCardSummary('  monkey  '), '"monkey"');
});
