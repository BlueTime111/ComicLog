import { formatRelativeTime } from '../../home/domain/formatRelativeTime';
import { buildHomeStatusLabel } from '../../home/domain/homeStatusLabel';
import { AppLocale } from '../../../i18n/locale';
import { getUpdateLabels } from '../../../i18n/updateLabels';
import { SeriesUpdateActivity } from './seriesRepository';

type RelativeTimeFormatter = (value: string, nowTimestamp?: string, locale?: AppLocale) => string;

export const buildSeriesUpdateMeta = (
  activity: SeriesUpdateActivity | null,
  formatTime: RelativeTimeFormatter = formatRelativeTime,
  locale: AppLocale = 'zh-CN',
): string => {
  const labels = getUpdateLabels(locale);

  if (!activity) {
    return `${labels.latestUpdatePrefix}${labels.noRecord}`;
  }

  return `${labels.latestUpdatePrefix}${buildHomeStatusLabel('UPDATED', activity.source, locale)} · ${formatTime(activity.updatedAt, undefined, locale)}`;
};
