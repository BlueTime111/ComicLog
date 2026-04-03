import { getSeriesStore } from '../store/seriesStore';
import { appendImportLog, getImportLogStore } from '../store/importLogStore';
import { markSeriesUpdated } from '../store/seriesActivityStore';
import { SeriesChapter } from '../../features/series/domain/recap';
import { ImportRepository } from '../../features/import/domain/importRepository';
import {
  buildImportConflictDetails,
  buildImportDiff,
  ImportApplyResult,
  ImportManualDecision,
  ImportLogRecord,
  ImportPreview,
  ImportStrategy,
  SummaryPack,
} from '../../features/import/domain/summaryPack';

const buildCoverageLabel = (pack: SummaryPack): string => {
  return `${pack.pack.coverage.start} - ${pack.pack.coverage.end}`;
};

const createChapterId = (seriesId: string, chapterNumber: string): string => {
  const normalizedNumber = chapterNumber.replace(/\s+/g, '-');
  return `${seriesId}-${normalizedNumber}`;
};

const resolveTargetSeries = (pack: SummaryPack) => {
  const store = getSeriesStore();
  return store.find((series) => series.id === pack.series.id);
};

export class MockImportRepository implements ImportRepository {
  async previewPack(pack: SummaryPack): Promise<ImportPreview> {
    const existingSeries = resolveTargetSeries(pack);
    const diff = buildImportDiff(pack.chapters, existingSeries?.chapters ?? []);
    const conflictChapters = buildImportConflictDetails(pack.chapters, existingSeries?.chapters ?? []);

    return {
      seriesId: existingSeries?.id ?? pack.series.id,
      seriesTitle: pack.series.title,
      packTitle: pack.pack.title,
      author: pack.pack.author,
      version: pack.pack.version,
      coverageLabel: buildCoverageLabel(pack),
      chapterCount: pack.chapters.length,
      addedCount: diff.addedCount,
      updatedCount: diff.updatedCount,
      conflictCount: diff.conflictCount,
      conflictChapters,
    };
  }

  async applyPack(
    pack: SummaryPack,
    strategy: ImportStrategy,
    manualDecisions: ImportManualDecision[] = [],
  ): Promise<ImportApplyResult> {
    const store = getSeriesStore();
    const manualDecisionMap = new Map(manualDecisions.map((decision) => [decision.number, decision]));
    let targetSeries = resolveTargetSeries(pack);

    if (!targetSeries) {
      targetSeries = {
        id: pack.series.id,
        title: pack.series.title,
        lastReadChapterNumber: pack.pack.coverage.end,
        chapters: [],
      };
      store.push(targetSeries);
    }

    const targetSeriesId = targetSeries.id;

    let addedCount = 0;
    let updatedCount = 0;
    let conflictCount = 0;
    let preservedPrivateCount = 0;

    for (const incomingChapter of pack.chapters) {
      const existingChapter = targetSeries.chapters.find(
        (chapter) => chapter.number === incomingChapter.number,
      );

      if (!existingChapter) {
        const newChapter: SeriesChapter = {
          id: createChapterId(targetSeriesId, incomingChapter.number),
          number: incomingChapter.number,
          title: incomingChapter.title ?? `Chapter ${incomingChapter.number}`,
          oneLineSummary: incomingChapter.summary,
          isRead: false,
        };

        targetSeries.chapters.push(newChapter);
        addedCount += 1;
        continue;
      }

      if (existingChapter.oneLineSummary.trim() === incomingChapter.summary.trim()) {
        continue;
      }

      conflictCount += 1;

      if (strategy === 'overwriteShared') {
        if (existingChapter.privateNote?.trim()) {
          preservedPrivateCount += 1;
        }

        existingChapter.oneLineSummary = incomingChapter.summary;
        if (incomingChapter.title?.trim()) {
          existingChapter.title = incomingChapter.title;
        }
        updatedCount += 1;
      }

      if (strategy === 'manual') {
        const decision = manualDecisionMap.get(incomingChapter.number);

        if (decision?.resolution === 'useIncoming') {
          if (existingChapter.privateNote?.trim()) {
            preservedPrivateCount += 1;
          }

          existingChapter.oneLineSummary = incomingChapter.summary;
          if (incomingChapter.title?.trim()) {
            existingChapter.title = incomingChapter.title;
          }
          updatedCount += 1;
        }
      }
    }

    const result = {
      addedCount,
      updatedCount,
      conflictCount,
      preservedPrivateCount,
    };

    const nextLog: ImportLogRecord = {
      id: `${pack.pack.packId}-${Date.now()}`,
      packId: pack.pack.packId,
      seriesId: targetSeriesId,
      packTitle: pack.pack.title,
      importedAt: new Date().toISOString(),
      strategy,
      addedCount: result.addedCount,
      updatedCount: result.updatedCount,
      conflictCount: result.conflictCount,
    };

    appendImportLog(nextLog);

    if (result.addedCount > 0 || result.updatedCount > 0) {
      markSeriesUpdated(targetSeriesId, 'import');
    }

    return result;
  }

  async listImportLogs() {
    return getImportLogStore();
  }
}
