import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveHomeCollection } from './homeCollection';

test('resolveHomeCollection 在存在未读章节时返回 tracking', () => {
  const collection = resolveHomeCollection([
    { isRead: true },
    { isRead: false },
  ]);

  assert.equal(collection, 'tracking');
});

test('resolveHomeCollection 在全部已读时返回 library', () => {
  const collection = resolveHomeCollection([
    { isRead: true },
    { isRead: true },
  ]);

  assert.equal(collection, 'library');
});

test('resolveHomeCollection 在无章节时返回 library', () => {
  const collection = resolveHomeCollection([]);

  assert.equal(collection, 'library');
});
