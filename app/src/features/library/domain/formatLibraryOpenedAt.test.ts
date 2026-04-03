import assert from 'node:assert/strict';
import test from 'node:test';

import { formatLibraryOpenedAt } from './formatLibraryOpenedAt';

test('formatLibraryOpenedAt 将 ISO 时间格式化为 yyyy/M/d HH:mm', () => {
  const label = formatLibraryOpenedAt('2026-04-03T07:00:00.000Z', 8 * 60);

  assert.equal(label, '2026/4/3 15:00');
});

test('formatLibraryOpenedAt 对空值返回 --', () => {
  assert.equal(formatLibraryOpenedAt(undefined), '--');
  assert.equal(formatLibraryOpenedAt('invalid-date'), '--');
});
