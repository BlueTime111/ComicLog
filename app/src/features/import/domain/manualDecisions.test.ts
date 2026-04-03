import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createDefaultManualDecisions,
  applyBulkManualResolution,
  type ManualResolution,
} from './manualDecisions';
import { ImportConflictChapter } from './summaryPack';

const conflictChapters: ImportConflictChapter[] = [
  {
    number: '1098',
    existingSummary: 'Existing A',
    incomingSummary: 'Incoming A',
  },
  {
    number: '1100',
    existingSummary: 'Existing B',
    incomingSummary: 'Incoming B',
  },
];

test('createDefaultManualDecisions 默认保留本地', () => {
  const result = createDefaultManualDecisions(conflictChapters);

  assert.deepEqual(result, {
    '1098': 'keepLocal',
    '1100': 'keepLocal',
  });
});

test('applyBulkManualResolution 可一键改为使用导入', () => {
  const current = createDefaultManualDecisions(conflictChapters);
  const result = applyBulkManualResolution(current, conflictChapters, 'useIncoming');

  assert.deepEqual(result, {
    '1098': 'useIncoming',
    '1100': 'useIncoming',
  });
});

test('applyBulkManualResolution 对空冲突列表保持不变', () => {
  const current: Record<string, ManualResolution> = {
    '1098': 'keepLocal',
  };

  const result = applyBulkManualResolution(current, [], 'useIncoming');

  assert.deepEqual(result, current);
});
