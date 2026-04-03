import { SummaryPack } from '../../import/domain/summaryPack';
import { SeriesDetail } from '../../series/domain/series';

type BuildExportPackOptions = {
  packId: string;
  packTitle: string;
  author: string;
  version: number;
  updatedAt: string;
  includeOnlyReadChapters?: boolean;
};

const getCoverage = (chapters: SeriesDetail['chapters']): { start: string; end: string } => {
  if (chapters.length === 0) {
    return {
      start: '0',
      end: '0',
    };
  }

  return {
    start: chapters[0]?.number ?? '0',
    end: chapters[chapters.length - 1]?.number ?? '0',
  };
};

export const buildExportPack = (
  series: SeriesDetail,
  options: BuildExportPackOptions,
): SummaryPack => {
  const exportChapters = options.includeOnlyReadChapters
    ? series.chapters.filter((chapter) => chapter.isRead)
    : series.chapters;

  const coverage = getCoverage(exportChapters);

  return {
    schemaVersion: '1.0',
    series: {
      id: series.id,
      title: series.title,
    },
    pack: {
      packId: options.packId,
      title: options.packTitle,
      author: options.author,
      version: options.version,
      updatedAt: options.updatedAt,
      coverage,
    },
    chapters: exportChapters.map((chapter) => ({
      number: chapter.number,
      title: chapter.title,
      summary: chapter.oneLineSummary,
    })),
  };
};
