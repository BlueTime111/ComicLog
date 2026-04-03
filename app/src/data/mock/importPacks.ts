export const samplePackRawJson = JSON.stringify(
  {
    schemaVersion: '1.0',
    series: {
      id: 'one-piece',
      title: '航海王',
    },
    pack: {
      packId: 'pack_one_piece_demo_v1',
      title: '航海王示例导入包',
      author: '本地用户',
      version: 1,
      updatedAt: '2026-03-30T12:00:00Z',
      coverage: {
        start: '1',
        end: '1100',
      },
    },
    chapters: [
      {
        number: '1098',
        title: '觉醒回响',
        summary: '路飞觉醒后正面战线被强势压制。',
      },
      {
        number: '1100',
        title: '余震',
        summary: '交锋结束后，关键势力重新站位。',
      },
    ],
  },
  null,
  2,
);
