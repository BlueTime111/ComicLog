import { SeriesChapter } from './recap';

export type ChapterLayersView = {
  sharedSummary: string;
  privateNote: string | null;
  privateTags: string[];
  combinedSummary: string;
};

const defaultSharedSummary = '暂无共享总结。';
const legacyEmptySharedSummaries = new Set(['暂无对应已读章节总结。']);

export const toOptionalLayerSummary = (value?: string | null): string | null => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || legacyEmptySharedSummaries.has(trimmed)) {
    return null;
  }

  return trimmed;
};

export const toSharedDraftValue = (value?: string | null): string => {
  return toOptionalLayerSummary(value) ?? '';
};

export const toSharedSummaryUpdateValue = (draft: string): string => {
  return toOptionalLayerSummary(draft) ?? '';
};

export const buildChapterLayersView = (chapter: SeriesChapter): ChapterLayersView => {
  const normalizedSharedSummary = toOptionalLayerSummary(chapter.oneLineSummary) ?? defaultSharedSummary;
  const normalizedPrivateNote = toOptionalLayerSummary(chapter.privateNote);
  const normalizedPrivateTags = (chapter.privateTags ?? []).map((tag) => tag.trim()).filter(Boolean);

  const combinedSummary = normalizedPrivateNote
    ? `${normalizedSharedSummary}\n我的补充：${normalizedPrivateNote}`
    : normalizedSharedSummary;

  return {
    sharedSummary: normalizedSharedSummary,
    privateNote: normalizedPrivateNote,
    privateTags: normalizedPrivateTags,
    combinedSummary,
  };
};

export const buildPreviewChapters = (chapters: SeriesChapter[]): SeriesChapter[] =>
  chapters.map((chapter) => ({
    ...chapter,
    oneLineSummary: buildChapterLayersView(chapter).combinedSummary,
  }));
