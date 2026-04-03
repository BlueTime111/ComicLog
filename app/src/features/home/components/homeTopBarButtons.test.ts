import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createTopBarButtonStyle,
  createTopBarButtonTextStyle,
  TOP_BAR_BUTTON_HEIGHT,
  TOP_BAR_BUTTON_MIN_WIDTH,
} from './homeTopBarButtons';

test('createTopBarButtonStyle 让主次按钮保持统一尺寸', () => {
  const secondaryStyle = createTopBarButtonStyle('secondary');
  const primaryStyle = createTopBarButtonStyle('primary');

  assert.equal(secondaryStyle.height, TOP_BAR_BUTTON_HEIGHT);
  assert.equal(primaryStyle.height, TOP_BAR_BUTTON_HEIGHT);
  assert.equal(secondaryStyle.minWidth, TOP_BAR_BUTTON_MIN_WIDTH);
  assert.equal(primaryStyle.minWidth, TOP_BAR_BUTTON_MIN_WIDTH);
  assert.equal(secondaryStyle.borderRadius, primaryStyle.borderRadius);
  assert.equal(secondaryStyle.paddingHorizontal, primaryStyle.paddingHorizontal);
});

test('createTopBarButtonTextStyle 让主次按钮仅颜色不同', () => {
  const secondaryTextStyle = createTopBarButtonTextStyle('secondary');
  const primaryTextStyle = createTopBarButtonTextStyle('primary');

  assert.equal(secondaryTextStyle.fontSize, primaryTextStyle.fontSize);
  assert.equal(secondaryTextStyle.fontWeight, primaryTextStyle.fontWeight);
  assert.equal(secondaryTextStyle.letterSpacing, primaryTextStyle.letterSpacing);
  assert.notEqual(secondaryTextStyle.color, primaryTextStyle.color);
});
