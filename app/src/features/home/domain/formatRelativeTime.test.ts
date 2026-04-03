import assert from 'node:assert/strict';
import test from 'node:test';

import { formatRelativeTime } from './formatRelativeTime';

const baseNow = '2026-04-01T12:00:00.000Z';

test('formatRelativeTime 对 1 分钟内显示 just now', () => {
  const label = formatRelativeTime('2026-04-01T11:59:40.000Z', baseNow);
  assert.equal(label, 'just now');
});

test('formatRelativeTime 在中文 locale 下返回 刚刚', () => {
  const label = formatRelativeTime('2026-04-01T11:59:40.000Z', baseNow, 'zh-CN');
  assert.equal(label, '刚刚');
});

test('formatRelativeTime 在中文 locale 下返回 分钟前', () => {
  const label = formatRelativeTime('2026-04-01T11:58:00.000Z', baseNow, 'zh-CN');
  assert.equal(label, '2分钟前');
});

test('formatRelativeTime 对小时级时间显示 h ago', () => {
  const label = formatRelativeTime('2026-04-01T10:00:00.000Z', baseNow);
  assert.equal(label, '2h ago');
});

test('formatRelativeTime 对天级时间显示 d ago', () => {
  const label = formatRelativeTime('2026-03-29T12:00:00.000Z', baseNow);
  assert.equal(label, '3d ago');
});

test('formatRelativeTime 对无效时间返回 just now', () => {
  const label = formatRelativeTime('invalid-time', baseNow);
  assert.equal(label, 'just now');
});
