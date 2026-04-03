import assert from 'node:assert/strict';
import test from 'node:test';

import { searchReadSummaries } from './searchReadSummaries';
import { SeriesDetail } from '../../series/domain/series';

const sampleSeries: SeriesDetail[] = [
  {
    id: 'one-piece',
    title: 'One Piece',
    lastReadChapterNumber: '1098',
    chapters: [
      {
        id: 'op-1098',
        number: '1098',
        title: 'Awakening Echo',
        oneLineSummary: 'Luffy shifts the battle momentum.',
        privateTags: ['战斗'],
        isRead: true,
      },
      {
        id: 'op-1099',
        number: '1099',
        title: 'Unseen Tide',
        oneLineSummary: 'Unread chapter summary.',
        privateTags: ['未读'],
        isRead: false,
      },
    ],
  },
  {
    id: 'vinland-saga',
    title: 'Vinland Saga',
    lastReadChapterNumber: '209',
    chapters: [
      {
        id: 'vs-209',
        number: '209',
        title: 'Silent Coast',
        oneLineSummary: 'Thorfinn chooses peace over revenge.',
        privateTags: ['人物'],
        isRead: true,
      },
    ],
  },
];

test('searchReadSummaries 支持按作品名匹配', () => {
  const result = searchReadSummaries(sampleSeries, 'vinland');

  assert.equal(result.length, 1);
  assert.equal(result[0]?.seriesId, 'vinland-saga');
  assert.ok(result[0]?.matchedFields.includes('seriesTitle'));
});

test('searchReadSummaries 支持按总结文本与标签匹配', () => {
  const summaryResult = searchReadSummaries(sampleSeries, 'momentum');
  const tagResult = searchReadSummaries(sampleSeries, '人物');

  assert.equal(summaryResult[0]?.chapterId, 'op-1098');
  assert.equal(tagResult[0]?.chapterId, 'vs-209');
  assert.ok(summaryResult[0]?.matchedFields.includes('summary'));
  assert.ok(tagResult[0]?.matchedFields.includes('tag'));
});

test('searchReadSummaries 返回已读和未读章节的匹配结果', () => {
  const result = searchReadSummaries(sampleSeries, 'unread');

  // 未读章节也被收录，用户可搜索自己记录过的所有内容
  assert.equal(result.length, 1);
  assert.equal(result[0]?.chapterId, 'op-1099');
});

test('searchReadSummaries 会忽略查询首尾空格并按固定顺序返回命中字段', () => {
  const result = searchReadSummaries(
    [
      {
        id: 'gear-world',
        title: 'Gear World',
        lastReadChapterNumber: 'gear-1',
        chapters: [
          {
            id: 'gw-gear-1',
            number: 'gear-1',
            title: 'Gear Shift',
            oneLineSummary: 'The crew uses gear power to survive.',
            privateTags: ['gear'],
            isRead: true,
          },
        ],
      },
    ],
    '  GEAR  ',
  );

  assert.equal(result.length, 1);
  assert.deepEqual(result[0]?.matchedFields, [
    'seriesTitle',
    'chapterNumber',
    'chapterTitle',
    'summary',
    'tag',
  ]);
});
