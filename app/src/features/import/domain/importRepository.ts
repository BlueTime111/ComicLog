import {
  ImportApplyResult,
  ImportManualDecision,
  ImportLogRecord,
  ImportPreview,
  ImportStrategy,
  SummaryPack,
} from './summaryPack';

export interface ImportRepository {
  previewPack(pack: SummaryPack): Promise<ImportPreview>;
  applyPack(
    pack: SummaryPack,
    strategy: ImportStrategy,
    manualDecisions?: ImportManualDecision[],
  ): Promise<ImportApplyResult>;
  listImportLogs(): Promise<ImportLogRecord[]>;
}
