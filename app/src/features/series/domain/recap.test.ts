import assert from 'node:assert/strict';
import test from 'node:test';

import { buildReadRecap, getChaptersByScope, getReadableChapters, type SeriesChapter } from './recap';

const chapters: SeriesChapter[] = [
  { id: 'c1', number: '1', title: 'Start', oneLineSummary: 'Hero enters the world.', isRead: true },
  { id: 'c2', number: '2', title: 'Meetup', oneLineSummary: 'Team members gather.', isRead: true },
  {
    id: 'c3',
    number: '3',
    title: 'Twist',
    oneLineSummary: 'A hidden enemy appears.',
    isRead: true,
  },
  {
    id: 'c4',
    number: '4',
    title: 'Counter',
    oneLineSummary: 'The team regroups and counters.',
    isRead: true,
  },
  {
    id: 'c5',
    number: '5',
    title: 'Cliffhanger',
    oneLineSummary: 'A major cliffhanger changes direction.',
    isRead: false,
  },
];

test('getReadableChapters 只返回已读范围内章节，防止剧透', () => {
  const readable = getReadableChapters(chapters, '4');

  assert.deepEqual(
    readable.map((chapter) => chapter.number),
    ['1', '2', '3', '4'],
  );
});

test('buildReadRecap 返回上一话 + 最近三话回顾，且不重叠', () => {
  const recap = buildReadRecap(chapters, '4');

  assert.equal(recap.previousChapter?.number, '4');
  assert.equal(recap.previousChapter?.oneLineSummary, 'The team regroups and counters.');
  assert.equal(recap.recentThree.length, 3);
  // recentThree 不包含 previousChapter，只显示其之前的章节，且按最新到最旧排序
  assert.deepEqual(
    recap.recentThree.map((chapter) => chapter.number),
    ['3', '2', '1'],
  );
  // 验证无重叠：previousChapter 不在 recentThree 中
  assert.ok(!recap.recentThree.some((c) => c.number === recap.previousChapter?.number));
});

test('buildReadRecap 在没有章节总结时给出引导文案', () => {
  const recap = buildReadRecap([], '10');

  assert.equal(recap.previousChapter, null);
  assert.equal(recap.recentThree.length, 0);
  assert.equal(recap.emptyHint, '暂无可回顾内容，请先补充最近一话的一句话总结。');
});

test('buildReadRecap 章节不足3话时 recentThree 正确截取且无重叠', () => {
  const twoChapters: SeriesChapter[] = [
    { id: 'a1', number: '1', title: 'Ch1', oneLineSummary: 'First.', isRead: true },
    { id: 'a2', number: '2', title: 'Ch2', oneLineSummary: 'Second.', isRead: true },
  ];

  const recap2 = buildReadRecap(twoChapters, '2');
  assert.equal(recap2.previousChapter?.number, '2');
  assert.deepEqual(recap2.recentThree.map((c) => c.number), ['1']);

  const oneChapter: SeriesChapter[] = [
    { id: 'b1', number: '1', title: 'Ch1', oneLineSummary: 'Only.', isRead: true },
  ];

  const recap1 = buildReadRecap(oneChapter, '1');
  assert.equal(recap1.previousChapter?.number, '1');
  assert.deepEqual(recap1.recentThree.map((c) => c.number), []);
});

test('getReadableChapters 支持非整数章节号（如番外）', () => {
  const mixedChapters: SeriesChapter[] = [
    { id: 'm1', number: '12', title: 'Main', oneLineSummary: 'Main line moves forward.', isRead: true },
    { id: 'm2', number: '12.5', title: 'Interlude', oneLineSummary: 'Small interlude.', isRead: true },
    { id: 'm3', number: '番外', title: 'Special', oneLineSummary: 'Special episode.', isRead: true },
    { id: 'm4', number: '13', title: 'Next', oneLineSummary: 'Next chapter starts.', isRead: false },
  ];

  const readable = getReadableChapters(mixedChapters, '番外');

  assert.deepEqual(
    readable.map((chapter) => chapter.number),
    ['12', '12.5', '番外'],
  );
});

test('getChaptersByScope 在未读范围时仅返回未读章节', () => {
  const visible = getChaptersByScope(chapters, '4', false);

  assert.deepEqual(
    visible.map((chapter) => chapter.number),
    ['5'],
  );
});
