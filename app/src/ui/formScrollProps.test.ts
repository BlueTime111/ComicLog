import assert from 'node:assert/strict';
import test from 'node:test';

import { formScrollProps } from './formScrollProps';

test('formScrollProps 允许在键盘打开时直接点击按钮', () => {
  assert.equal(formScrollProps.keyboardShouldPersistTaps, 'handled');
});
