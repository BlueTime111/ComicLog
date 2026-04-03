export type SyncStatus = 'UPDATED' | 'SYNCED';

export type RecentlyViewedComic = {
  id: string;
  title: string;
  chapterLabel: string;
  coverColor: string;
  coverAccent: string;
  coverText: string;
};

export type MyComic = {
  id: string;
  title: string;
  oneLineSummary: string;
  progressChapter: number;
  progressRatio: number;
  status: SyncStatus;
  statusLabel?: string;
  updatedAgoLabel: string;
  updatedAt?: string;
  coverColor: string;
  coverAccent: string;
  coverText: string;
  collection: 'tracking' | 'library';
};
