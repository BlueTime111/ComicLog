import { ImportConflictChapter } from './summaryPack';

export type ManualResolution = 'keepLocal' | 'useIncoming';

export const createDefaultManualDecisions = (
  conflictChapters: ImportConflictChapter[],
): Record<string, ManualResolution> => {
  return Object.fromEntries(conflictChapters.map((conflict) => [conflict.number, 'keepLocal']));
};

export const applyBulkManualResolution = (
  current: Record<string, ManualResolution>,
  conflictChapters: ImportConflictChapter[],
  resolution: ManualResolution,
): Record<string, ManualResolution> => {
  if (conflictChapters.length === 0) {
    return current;
  }

  const next = { ...current };

  for (const conflict of conflictChapters) {
    next[conflict.number] = resolution;
  }

  return next;
};
