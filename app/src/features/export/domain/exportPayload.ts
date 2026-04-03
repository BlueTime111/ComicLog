import { SummaryPack } from '../../import/domain/summaryPack';

type BuildExportFileNameInput = {
  seriesId: string;
  version: number;
  timestamp: string;
};

const normalizeSeriesId = (seriesId: string): string => {
  return seriesId
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const normalizeDate = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'unknown-date';
  }

  return date.toISOString().slice(0, 10);
};

export const serializeExportPack = (pack: SummaryPack): string => {
  return JSON.stringify(pack, null, 2);
};

export const buildExportFileName = ({
  seriesId,
  version,
  timestamp,
}: BuildExportFileNameInput): string => {
  const safeSeriesId = normalizeSeriesId(seriesId) || 'series';
  const safeDate = normalizeDate(timestamp);
  const safeVersion = Number.isFinite(version) && version > 0 ? Math.floor(version) : 1;

  return `summary-pack-${safeSeriesId}-v${safeVersion}-${safeDate}.json`;
};
