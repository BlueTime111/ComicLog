import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RECENTLY_VIEWED_CARD_WIDTH,
  RECENTLY_VIEWED_COVER_ASPECT_RATIO,
  TRACKING_COVER_ASPECT_RATIO,
  TRACKING_COVER_HEIGHT,
  TRACKING_COVER_WIDTH,
} from './homeCoverLayout';

test('最近阅读封面区域使用竖向长方形', () => {
  assert.equal(RECENTLY_VIEWED_CARD_WIDTH, 120);
  assert.ok(RECENTLY_VIEWED_COVER_ASPECT_RATIO < 1);
});

test('我的漫画封面缩略图与最近阅读保持同一长方形比例', () => {
  assert.ok(TRACKING_COVER_WIDTH > 0);
  assert.ok(TRACKING_COVER_HEIGHT > 0);
  assert.ok(TRACKING_COVER_ASPECT_RATIO < 1);
  assert.equal(TRACKING_COVER_ASPECT_RATIO, RECENTLY_VIEWED_COVER_ASPECT_RATIO);
});
