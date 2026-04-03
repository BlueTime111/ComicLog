import { AppLocale } from '../../../i18n/locale';

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const formatJustNow = (locale: AppLocale): string => (locale === 'zh-CN' ? '刚刚' : 'just now');

export const formatRelativeTime = (
  timestamp: string,
  nowTimestamp?: string,
  locale: AppLocale = 'en',
): string => {
  const updatedTime = new Date(timestamp).getTime();
  const nowTime = nowTimestamp ? new Date(nowTimestamp).getTime() : Date.now();

  if (!Number.isFinite(updatedTime) || !Number.isFinite(nowTime)) {
    return formatJustNow(locale);
  }

  const diff = Math.max(0, nowTime - updatedTime);

  if (diff < MS_PER_MINUTE) {
    return formatJustNow(locale);
  }

  if (diff < MS_PER_HOUR) {
    const minutes = Math.floor(diff / MS_PER_MINUTE);
    return locale === 'zh-CN' ? `${minutes}分钟前` : `${minutes}m ago`;
  }

  if (diff < MS_PER_DAY) {
    const hours = Math.floor(diff / MS_PER_HOUR);
    return locale === 'zh-CN' ? `${hours}小时前` : `${hours}h ago`;
  }

  const days = Math.floor(diff / MS_PER_DAY);
  return locale === 'zh-CN' ? `${days}天前` : `${days}d ago`;
};
