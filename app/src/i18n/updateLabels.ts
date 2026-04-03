import { AppLocale } from './locale';

type UpdateLabels = {
  synced: string;
  updated: string;
  imported: string;
  edited: string;
  latestUpdatePrefix: string;
  noRecord: string;
};

const labelsByLocale: Record<AppLocale, UpdateLabels> = {
  'zh-CN': {
    synced: '已同步',
    updated: '有更新',
    imported: '导入更新',
    edited: '手动编辑',
    latestUpdatePrefix: '最近更新：',
    noRecord: '暂无记录',
  },
  en: {
    synced: 'Synced',
    updated: 'Updated',
    imported: 'Imported',
    edited: 'Edited',
    latestUpdatePrefix: 'Latest update: ',
    noRecord: 'none',
  },
};

export const getUpdateLabels = (locale: AppLocale): UpdateLabels => {
  return labelsByLocale[locale];
};
