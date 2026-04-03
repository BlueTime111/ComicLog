import { SyncStatus } from '../../../types/comic';
import { AppLocale } from '../../../i18n/locale';
import { getUpdateLabels } from '../../../i18n/updateLabels';
import { SeriesUpdateActivity } from '../../series/domain/seriesRepository';

export const buildHomeStatusLabel = (
  status: SyncStatus,
  source?: SeriesUpdateActivity['source'],
  locale: AppLocale = 'zh-CN',
): string => {
  const labels = getUpdateLabels(locale);

  if (status !== 'UPDATED') {
    return labels.synced;
  }

  if (source === 'import') {
    return labels.imported;
  }

  if (source === 'edit') {
    return labels.edited;
  }

  return labels.updated;
};
