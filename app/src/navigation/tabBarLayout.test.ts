import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BASE_TAB_BAR_HEIGHT,
  BASE_TAB_BAR_PADDING_BOTTOM,
  buildTabBarStyle,
} from './tabBarLayout';

test('buildTabBarStyle 在有底部安全区时抬高 TabBar 高度与底部内边距', () => {
  const style = buildTabBarStyle(24);

  assert.equal(style.height, BASE_TAB_BAR_HEIGHT + 24);
  assert.equal(style.paddingBottom, BASE_TAB_BAR_PADDING_BOTTOM + 24);
});

test('buildTabBarStyle 在无底部安全区时保持基础高度', () => {
  const style = buildTabBarStyle(0);

  assert.equal(style.height, BASE_TAB_BAR_HEIGHT);
  assert.equal(style.paddingBottom, BASE_TAB_BAR_PADDING_BOTTOM);
});
