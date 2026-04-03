export type AppLocale = 'zh-CN' | 'en';

export const resolveAppLocale = (value?: string): AppLocale => {
  return value === 'en' ? 'en' : 'zh-CN';
};
