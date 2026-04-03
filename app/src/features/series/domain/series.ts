import { SeriesChapter } from './recap';

export type SeriesDetail = {
  id: string;
  title: string;
  lastReadChapterNumber: string;
  chapters: SeriesChapter[];
};
