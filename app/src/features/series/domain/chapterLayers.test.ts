import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildChapterLayersView,
  buildPreviewChapters,
  toOptionalLayerSummary,
  toSharedDraftValue,
  toSharedSummaryUpdateValue,
} from './chapterLayers';
import { SeriesChapter } from './recap';

test('toOptionalLayerSummary 将空白内容归一化为 null', () => {
  assert.equal(toOptionalLayerSummary('   '), null);
  assert.equal(toOptionalLayerSummary(''), null);
  assert.equal(toOptionalLayerSummary(undefined), null);
});

test('toOptionalLayerSummary 返回去空格后的有效内容', () => {
  assert.equal(toOptionalLayerSummary('  hello  '), 'hello');
});

test('toOptionalLayerSummary 将历史占位共享文案视为空', () => {
  assert.equal(toOptionalLayerSummary('暂无对应已读章节总结。'), null);
});

test('toSharedDraftValue 将空共享层显示为空输入框', () => {
  assert.equal(toSharedDraftValue('   '), '');
  assert.equal(toSharedDraftValue('暂无对应已读章节总结。'), '');
  assert.equal(toSharedDraftValue(' 有效总结 '), '有效总结');
});

test('toSharedSummaryUpdateValue 允许保存空共享层', () => {
  assert.equal(toSharedSummaryUpdateValue('   '), '');
  assert.equal(toSharedSummaryUpdateValue('  Keep this  '), 'Keep this');
});

test('buildChapterLayersView 同时保留共享层与私人层内容', () => {
  const chapter: SeriesChapter = {
    id: 'c-1',
    number: '1098',
    title: 'Awakening Echo',
    oneLineSummary: 'Luffy gains momentum in the current battle.',
    privateNote: 'Focus on the side effect mentioned in the final panel.',
    privateTags: ['伏笔', '战斗'],
    isRead: true,
  };

  const view = buildChapterLayersView(chapter);

  assert.equal(view.sharedSummary, 'Luffy gains momentum in the current battle.');
  assert.equal(view.privateNote, 'Focus on the side effect mentioned in the final panel.');
  assert.deepEqual(view.privateTags, ['伏笔', '战斗']);
  assert.equal(
    view.combinedSummary,
    'Luffy gains momentum in the current battle.\n我的补充：Focus on the side effect mentioned in the final panel.',
  );
});

test('buildChapterLayersView 在没有私人层时不拼接补充文案', () => {
  const chapter: SeriesChapter = {
    id: 'c-2',
    number: '612',
    title: 'Silent Door',
    oneLineSummary: 'A sealed passage opens with unclear intent.',
    isRead: true,
  };

  const view = buildChapterLayersView(chapter);

  assert.equal(view.privateNote, null);
  assert.equal(view.combinedSummary, 'A sealed passage opens with unclear intent.');
  assert.deepEqual(view.privateTags, []);
});

test('buildChapterLayersView 在共享层为空时使用默认提示', () => {
  const chapter: SeriesChapter = {
    id: 'c-3',
    number: '3',
    title: 'Untitled',
    oneLineSummary: '   ',
    privateNote: 'Remember this turning point.',
    isRead: true,
  };

  const view = buildChapterLayersView(chapter);

  assert.equal(view.sharedSummary, '暂无共享总结。');
  assert.equal(view.combinedSummary, '暂无共享总结。\n我的补充：Remember this turning point.');
});

test('buildPreviewChapters 生成包含共享层与私人补充的预览摘要', () => {
  const chapters: SeriesChapter[] = [
    {
      id: 'c-4',
      number: '1',
      title: '旋涡一族',
      oneLineSummary: '',
      privateNote: '漩涡鸣人登场',
      isRead: true,
    },
  ];

  const preview = buildPreviewChapters(chapters);

  assert.equal(preview[0]?.oneLineSummary, '暂无共享总结。\n我的补充：漩涡鸣人登场');
});
