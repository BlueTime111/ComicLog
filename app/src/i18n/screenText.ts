import { AppLocale } from './locale';
import { ImportStrategy } from '../features/import/domain/summaryPack';

export type SeriesDetailText = {
  loadingSeries: string;
  notFoundTitle: string;
  notFoundHint: string;
  readProgressPrefix: string;
  exportSharedPackButton: string;
  exportScopeReadOnly: string;
  exportScopeIncludeUnread: string;
  exportPreviewTitle: string;
  fileNameLabel: string;
  copyJsonButton: string;
  saveFileButton: string;
  copyJsonSuccess: string;
  browserDownloadTriggered: string;
  saveFailedNoDirectory: string;
  shareDialogTitle: string;
  shareOpened: string;
  manageSeriesButton: string;
  addChapterButton: string;
  chapterSummaryTitle: string;
  exportGeneratedReadOnly: (fileName: string) => string;
  exportGeneratedIncludeUnread: (fileName: string) => string;
  savedTo: (targetPath: string) => string;
};

export type ChapterDetailText = {
  loadingChapter: string;
  notFoundTitle: string;
  notFoundHint: string;
  readStatusCheckedLabel: string;
  readStatusUncheckedLabel: string;
  readStatusToggleFailed: string;
  sharedSummaryTitle: string;
  sharedPlaceholder: string;
  privateNotesTitle: string;
  privatePlaceholder: string;
  saveButtonIdle: string;
  saveButtonSaving: string;
  saveSuccess: string;
  saveNoChanges: string;
  combinedPreviewTitle: string;
  combinedPreviewHint: string;
  previewSharedLabel: string;
  previewPrivateLabel: string;
  previewPrivateEmpty: string;
};

export type ChapterCreateText = {
  title: string;
  chapterNumberLabel: string;
  chapterNumberPlaceholder: string;
  chapterTitleLabel: string;
  chapterTitlePlaceholder: string;
  chapterSummaryLabel: string;
  chapterSummaryPlaceholder: string;
  markAsReadLabel: string;
  saveButton: string;
  saveFailed: string;
  validationFailed: string;
};

export type ImportScreenText = {
  title: string;
  description: string;
  loadSampleButton: string;
  pickLocalFileButton: string;
  sampleLoadedHint: string;
  fileNotReadHint: string;
  fileReadFailedHint: string;
  fileSelectedHint: (name: string) => string;
  inputPlaceholder: string;
  previewButton: string;
  cardSeriesLabel: string;
  cardAuthorLabel: string;
  cardVersionLabel: string;
  cardCoverageLabel: string;
  cardChapterCountLabel: string;
  statAddedLabel: string;
  statUpdatedLabel: string;
  statConflictLabel: string;
  conflictTitle: string;
  localSummaryPrefix: string;
  incomingSummaryPrefix: string;
  keepLocalButton: string;
  useIncomingButton: string;
  strategyTitle: string;
  bulkKeepLocalButton: string;
  bulkUseIncomingButton: string;
  applyImportButton: string;
  resultTitle: string;
  resultAddedLine: string;
  resultUpdatedLine: string;
  resultConflictLine: string;
  resultPreservedPrivateLine: string;
};

export type SearchScreenText = {
  title: string;
  description: string;
  inputPlaceholder: string;
  loadingHint: string;
  emptyTitle: string;
  emptyDescription: string;
  matchedFieldsPrefix: string;
  matchedFieldSeriesTitle: string;
  matchedFieldChapterNumber: string;
  matchedFieldChapterTitle: string;
  matchedFieldSummary: string;
  matchedFieldTag: string;
};

export type LibraryScreenText = {
  title: string;
  description: (seriesCount: number) => string;
  loadingHint: string;
  createButton: string;
  importButton: string;
  sortRecentFirst: string;
  sortOldestFirst: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCreateButton: string;
  chapterCountLabel: string;
  lastReadPrefix: string;
};

export type SettingsScreenText = {
  title: string;
  description: string;
  runtimeInfoTitle: string;
  runtimeLocaleLabel: string;
  runtimeConfiguredSourceLabel: string;
  runtimeResolvedSourceLabel: string;
  runtimePlatformLabel: string;
  aboutTitle: string;
  aboutDescription: string;
};

export type HomeScreenText = {
  recentlyViewedTitle: string;
  myComicsTitle: string;
  topSearchPlaceholder: string;
  topSearchCancelButton: string;
  inlineSearchEmptyStateText: string;
  segmentTracking: string;
  segmentLibrary: string;
  progressLabelPrefix: string;
  emptyStateText: string;
  importButton: string;
  topCreateButton: string;
  emptyPrimaryImportButton: string;
  emptySecondaryCreateButton: string;
};

export type NavigationText = {
  tabHome: string;
  tabLibrary: string;
  tabSettings: string;
  stackSearch: string;
  stackImport: string;
  stackSeriesDetail: string;
  stackChapterDetail: string;
  stackSeriesManage: string;
  stackChapterCreate: string;
};

export type SeriesSharedText = {
  recapTitle: string;
  previousChapterPrefix: string;
  recentThreeTitle: string;
  chapterRowViewHint: string;
  sharedLayerLabel: string;
  privateLayerLabel: string;
};

export type SeriesManageText = {
  titleCreate: string;
  titleEdit: string;
  seriesTitleLabel: string;
  seriesTitlePlaceholder: string;
  progressLabel: string;
  progressPlaceholder: string;
  saveButton: string;
  deleteButton: string;
  saveSuccess: string;
  saveFailed: string;
  deleteSuccess: string;
  deleteFailed: string;
};

export type ImportStrategyOption = {
  key: ImportStrategy;
  label: string;
  description: string;
};

const seriesDetailTextByLocale: Record<AppLocale, SeriesDetailText> = {
  'zh-CN': {
    loadingSeries: 'Loading series...',
    notFoundTitle: 'Series not found',
    notFoundHint: 'This series has not been added to the local mock repository.',
    readProgressPrefix: '已读进度：Ch. ',
    exportSharedPackButton: '导出共享层 JSON',
    exportScopeReadOnly: '仅已读章节',
    exportScopeIncludeUnread: '仅未读章节',
    exportPreviewTitle: '导出预览（默认不含私人备注）',
    fileNameLabel: '文件名：',
    copyJsonButton: '复制 JSON',
    saveFileButton: '保存文件',
    copyJsonSuccess: '已复制 JSON 到剪贴板。',
    browserDownloadTriggered: '已触发浏览器下载。',
    saveFailedNoDirectory: '保存失败：当前设备无可用目录。',
    shareDialogTitle: 'Share Summary Pack',
    shareOpened: '已打开系统分享面板。',
    manageSeriesButton: '管理作品',
    addChapterButton: '新增章节',
    chapterSummaryTitle: '章节摘要',
    exportGeneratedReadOnly: (fileName) => `已生成导出内容（仅已读章节）：${fileName}`,
    exportGeneratedIncludeUnread: (fileName) => `已生成导出内容（含未读章节）：${fileName}`,
    savedTo: (targetPath) => `已保存到：${targetPath}`,
  },
  en: {
    loadingSeries: 'Loading series...',
    notFoundTitle: 'Series not found',
    notFoundHint: 'This series has not been added to the local mock repository.',
    readProgressPrefix: 'Read progress: Ch. ',
    exportSharedPackButton: 'Export shared JSON',
    exportScopeReadOnly: 'Read chapters only',
    exportScopeIncludeUnread: 'Unread chapters only',
    exportPreviewTitle: 'Export preview (private notes excluded by default)',
    fileNameLabel: 'Filename: ',
    copyJsonButton: 'Copy JSON',
    saveFileButton: 'Save file',
    copyJsonSuccess: 'JSON copied to clipboard.',
    browserDownloadTriggered: 'Browser download triggered.',
    saveFailedNoDirectory: 'Save failed: no writable directory is available on this device.',
    shareDialogTitle: 'Share Summary Pack',
    shareOpened: 'System share sheet opened.',
    manageSeriesButton: 'Manage series',
    addChapterButton: 'Add chapter',
    chapterSummaryTitle: 'Chapter summaries',
    exportGeneratedReadOnly: (fileName) => `Export ready (read chapters only): ${fileName}`,
    exportGeneratedIncludeUnread: (fileName) => `Export ready (including unread chapters): ${fileName}`,
    savedTo: (targetPath) => `Saved to: ${targetPath}`,
  },
};

const chapterDetailTextByLocale: Record<AppLocale, ChapterDetailText> = {
  'zh-CN': {
    loadingChapter: 'Loading chapter...',
    notFoundTitle: 'Chapter not found',
    notFoundHint: 'This chapter is not in local mock data yet.',
    readStatusCheckedLabel: '已读',
    readStatusUncheckedLabel: '标记为已读',
    readStatusToggleFailed: '更新已读状态失败。',
    sharedSummaryTitle: '共享总结',
    sharedPlaceholder: '暂无共享总结（可选）',
    privateNotesTitle: '我的补充',
    privatePlaceholder: '添加你的私人补充...',
    saveButtonIdle: '保存章节内容',
    saveButtonSaving: '保存中...',
    saveSuccess: '已保存章节总结。',
    saveNoChanges: '保存失败或未检测到改动。',
    combinedPreviewTitle: '合并预览',
    combinedPreviewHint: '按最终阅读顺序展示：共享层在前，私人补充在后。',
    previewSharedLabel: '共享',
    previewPrivateLabel: '我的补充',
    previewPrivateEmpty: '暂无私人补充。',
  },
  en: {
    loadingChapter: 'Loading chapter...',
    notFoundTitle: 'Chapter not found',
    notFoundHint: 'This chapter is not in local mock data yet.',
    readStatusCheckedLabel: 'Read',
    readStatusUncheckedLabel: 'Mark as read',
    readStatusToggleFailed: 'Failed to update read status.',
    sharedSummaryTitle: 'Shared summary',
    sharedPlaceholder: 'No shared summary yet (optional)',
    privateNotesTitle: 'My notes',
    privatePlaceholder: 'Add your private notes...',
    saveButtonIdle: 'Save chapter content',
    saveButtonSaving: 'Saving...',
    saveSuccess: 'Chapter summary saved.',
    saveNoChanges: 'Save failed or no changes detected.',
    combinedPreviewTitle: 'Combined preview',
    combinedPreviewHint: 'Shared layer appears first, then your private note.',
    previewSharedLabel: 'Shared layer',
    previewPrivateLabel: 'Private note',
    previewPrivateEmpty: 'No private note yet.',
  },
};

const chapterCreateTextByLocale: Record<AppLocale, ChapterCreateText> = {
  'zh-CN': {
    title: '新增章节',
    chapterNumberLabel: '章节号',
    chapterNumberPlaceholder: '例如：1099 / 12.5 / 番外',
    chapterTitleLabel: '章节标题',
    chapterTitlePlaceholder: '输入章节标题（可选）',
    chapterSummaryLabel: '我的一句话总结',
    chapterSummaryPlaceholder: '输入你的私人补充（可选）',
    markAsReadLabel: '标记为已读',
    saveButton: '保存章节',
    saveFailed: '保存失败，请检查章节号后重试。',
    validationFailed: '章节号不能为空。',
  },
  en: {
    title: 'Add chapter',
    chapterNumberLabel: 'Chapter number',
    chapterNumberPlaceholder: 'e.g. 1099 / 12.5 / Extra',
    chapterTitleLabel: 'Chapter title',
    chapterTitlePlaceholder: 'Enter chapter title (optional)',
    chapterSummaryLabel: 'My one-line note',
    chapterSummaryPlaceholder: 'Enter your private note (optional)',
    markAsReadLabel: 'Mark as read',
    saveButton: 'Save chapter',
    saveFailed: 'Save failed. Check chapter number and retry.',
    validationFailed: 'Chapter number is required.',
  },
};

const importScreenTextByLocale: Record<AppLocale, ImportScreenText> = {
  'zh-CN': {
    title: '',
    description: 'MVP 先支持手动粘贴 JSON 内容。后续会接入本地文件选择与链接导入。',
    loadSampleButton: '加载示例总结包',
    pickLocalFileButton: '选择本地 JSON 文件',
    sampleLoadedHint: '已加载内置示例。',
    fileNotReadHint: '未读取到文件内容。',
    fileReadFailedHint: '文件读取失败，请重试。',
    fileSelectedHint: (name) => `已选择文件：${name}`,
    inputPlaceholder: '将总结包 JSON 粘贴在这里...',
    previewButton: '解析并预览',
    cardSeriesLabel: 'Series: ',
    cardAuthorLabel: 'Author: ',
    cardVersionLabel: 'Version: ',
    cardCoverageLabel: 'Coverage: ',
    cardChapterCountLabel: 'Chapters: ',
    statAddedLabel: '新增 ',
    statUpdatedLabel: '更新 ',
    statConflictLabel: '冲突 ',
    conflictTitle: '冲突章节明细',
    localSummaryPrefix: '本地：',
    incomingSummaryPrefix: '导入：',
    keepLocalButton: '保留本地',
    useIncomingButton: '使用导入',
    strategyTitle: '导入策略',
    bulkKeepLocalButton: '全部保留本地',
    bulkUseIncomingButton: '全部使用导入',
    applyImportButton: '应用导入',
    resultTitle: '导入完成',
    resultAddedLine: '新增章节：',
    resultUpdatedLine: '更新章节：',
    resultConflictLine: '检测冲突：',
    resultPreservedPrivateLine: '保留私人备注：',
  },
  en: {
    title: '',
    description: 'MVP currently supports manual JSON paste. Local file and link import will be added next.',
    loadSampleButton: 'Load sample pack',
    pickLocalFileButton: 'Choose local JSON file',
    sampleLoadedHint: 'Built-in sample loaded.',
    fileNotReadHint: 'Failed to read file content.',
    fileReadFailedHint: 'File read failed. Please try again.',
    fileSelectedHint: (name) => `Selected file: ${name}`,
    inputPlaceholder: 'Paste summary pack JSON here...',
    previewButton: 'Parse and preview',
    cardSeriesLabel: 'Series: ',
    cardAuthorLabel: 'Author: ',
    cardVersionLabel: 'Version: ',
    cardCoverageLabel: 'Coverage: ',
    cardChapterCountLabel: 'Chapters: ',
    statAddedLabel: 'Added ',
    statUpdatedLabel: 'Updated ',
    statConflictLabel: 'Conflicts ',
    conflictTitle: 'Conflict details',
    localSummaryPrefix: 'Local: ',
    incomingSummaryPrefix: 'Incoming: ',
    keepLocalButton: 'Keep local',
    useIncomingButton: 'Use incoming',
    strategyTitle: 'Import strategy',
    bulkKeepLocalButton: 'Keep local for all',
    bulkUseIncomingButton: 'Use incoming for all',
    applyImportButton: 'Apply import',
    resultTitle: 'Import complete',
    resultAddedLine: 'Added chapters: ',
    resultUpdatedLine: 'Updated chapters: ',
    resultConflictLine: 'Detected conflicts: ',
    resultPreservedPrivateLine: 'Preserved private notes: ',
  },
};

const importStrategyOptionsByLocale: Record<AppLocale, ImportStrategyOption[]> = {
  'zh-CN': [
    {
      key: 'missingOnly',
      label: '仅导入缺失章节',
      description: '已有章节不覆盖，适合安全合并。',
    },
    {
      key: 'overwriteShared',
      label: '覆盖共享层',
      description: '更新已有共享总结，保留私人备注。',
    },
    {
      key: 'manual',
      label: '逐条处理冲突',
      description: '对每个冲突章节单独选择保留本地或使用导入。',
    },
  ],
  en: [
    {
      key: 'missingOnly',
      label: 'Import missing chapters only',
      description: 'Do not overwrite existing chapters. Safe merge mode.',
    },
    {
      key: 'overwriteShared',
      label: 'Overwrite shared layer',
      description: 'Update existing shared summaries while keeping private notes.',
    },
    {
      key: 'manual',
      label: 'Resolve conflicts manually',
      description: 'Choose keep-local or use-incoming for each conflict chapter.',
    },
  ],
};

const searchScreenTextByLocale: Record<AppLocale, SearchScreenText> = {
  'zh-CN': {
    title: 'Search',
    description: '按作品、章节号、总结、标签搜索（仅展示已读章节）。',
    inputPlaceholder: '例如：one piece / 1098 / 战斗',
    loadingHint: 'Loading local index...',
    emptyTitle: '没有匹配结果',
    emptyDescription: '试试作品名、章节号或一句话总结关键词。',
    matchedFieldsPrefix: '命中字段',
    matchedFieldSeriesTitle: '作品名',
    matchedFieldChapterNumber: '章节号',
    matchedFieldChapterTitle: '章节标题',
    matchedFieldSummary: '总结',
    matchedFieldTag: '标签',
  },
  en: {
    title: 'Search',
    description: 'Search by series, chapter, summary, or tags (read chapters only).',
    inputPlaceholder: 'Example: one piece / 1098 / battle',
    loadingHint: 'Loading local index...',
    emptyTitle: 'No matching results',
    emptyDescription: 'Try a series title, chapter number, or summary keywords.',
    matchedFieldsPrefix: 'Matched fields',
    matchedFieldSeriesTitle: 'Series',
    matchedFieldChapterNumber: 'Chapter #',
    matchedFieldChapterTitle: 'Chapter title',
    matchedFieldSummary: 'Summary',
    matchedFieldTag: 'Tag',
  },
};

const libraryScreenTextByLocale: Record<AppLocale, LibraryScreenText> = {
  'zh-CN': {
    title: '书库',
    description: (seriesCount) => `已收录作品 ${seriesCount} 部`,
    loadingHint: '加载中...',
    createButton: '新建',
    importButton: '导入',
    sortRecentFirst: '由近到远',
    sortOldestFirst: '由远到近',
    emptyTitle: '暂无作品',
    emptyDescription: '点击上方新建，创建第一部作品',
    emptyCreateButton: '新建作品',
    chapterCountLabel: '章节',
    lastReadPrefix: '进度: Ch.',
  },
  en: {
    title: 'Library',
    description: (seriesCount) => `${seriesCount} series tracked`,
    loadingHint: 'Loading...',
    createButton: 'NEW',
    importButton: 'IMPORT',
    sortRecentFirst: 'Recent to old',
    sortOldestFirst: 'Old to recent',
    emptyTitle: 'No series yet',
    emptyDescription: 'Tap NEW above to create your first series',
    emptyCreateButton: 'Create series',
    chapterCountLabel: 'chapters',
    lastReadPrefix: 'Progress: Ch.',
  },
};

const settingsScreenTextByLocale: Record<AppLocale, SettingsScreenText> = {
  'zh-CN': {
    title: '设置',
    description: '检查当前运行状态。',
    runtimeInfoTitle: '运行时信息',
    runtimeLocaleLabel: '界面语言',
    runtimeConfiguredSourceLabel: '配置数据源',
    runtimeResolvedSourceLabel: '实际数据源',
    runtimePlatformLabel: '运行平台',
    aboutTitle: '关于',
    aboutDescription: 'ComicLog 是一款帮助你追踪漫画阅读进度、记录章节一句话总结并快速回顾剧情的工具。',
  },
  en: {
    title: 'Settings',
    description: 'Check runtime status.',
    runtimeInfoTitle: 'Runtime info',
    runtimeLocaleLabel: 'UI locale',
    runtimeConfiguredSourceLabel: 'Configured data source',
    runtimeResolvedSourceLabel: 'Resolved data source',
    runtimePlatformLabel: 'Runtime platform',
    aboutTitle: 'About',
    aboutDescription: 'ComicLog helps you track comic reading progress, save one-line chapter recaps, and quickly review plot points.',
  },
};

const homeScreenTextByLocale: Record<AppLocale, HomeScreenText> = {
  'zh-CN': {
    recentlyViewedTitle: '最近阅读',
    myComicsTitle: '我的漫画',
    topSearchPlaceholder: '搜索作品或一句话总结',
    topSearchCancelButton: '取消',
    inlineSearchEmptyStateText: '没有匹配结果。',
    segmentTracking: '追更中',
    segmentLibrary: '书库',
    progressLabelPrefix: '进度: Ch. ',
    emptyStateText: '当前分组暂无漫画。',
    importButton: '导入',
    topCreateButton: '新建',
    emptyPrimaryImportButton: '导入总结包',
    emptySecondaryCreateButton: '新建作品',
  },
  en: {
    recentlyViewedTitle: 'Recently Viewed',
    myComicsTitle: 'My Comics',
    topSearchPlaceholder: 'Search series or recap',
    topSearchCancelButton: 'Cancel',
    inlineSearchEmptyStateText: 'No matching comics.',
    segmentTracking: 'Tracking',
    segmentLibrary: 'Library',
    progressLabelPrefix: 'Progress: Ch. ',
    emptyStateText: 'No comics in this section yet.',
    importButton: 'IMPORT',
    topCreateButton: 'NEW',
    emptyPrimaryImportButton: 'Import pack',
    emptySecondaryCreateButton: 'Create series',
  },
};

const navigationTextByLocale: Record<AppLocale, NavigationText> = {
  'zh-CN': {
    tabHome: '首页',
    tabLibrary: '书库',
    tabSettings: '设置',
    stackSearch: '搜索',
    stackImport: '导入',
    stackSeriesDetail: '作品详情',
    stackChapterDetail: '章节详情',
    stackSeriesManage: '作品管理',
    stackChapterCreate: '新增章节',
  },
  en: {
    tabHome: 'Home',
    tabLibrary: 'Library',
    tabSettings: 'Settings',
    stackSearch: 'Search',
    stackImport: 'Import',
    stackSeriesDetail: 'Series Detail',
    stackChapterDetail: 'Chapter Detail',
    stackSeriesManage: 'Manage Series',
    stackChapterCreate: 'Add Chapter',
  },
};

const seriesSharedTextByLocale: Record<AppLocale, SeriesSharedText> = {
  'zh-CN': {
    recapTitle: '读前回顾',
    previousChapterPrefix: '上一话',
    recentThreeTitle: '最近三话',
    chapterRowViewHint: '查看',
    sharedLayerLabel: '共享',
    privateLayerLabel: '我的',
  },
  en: {
    recapTitle: 'Pre-read recap',
    previousChapterPrefix: 'Previous',
    recentThreeTitle: 'Recent three',
    chapterRowViewHint: 'View',
    sharedLayerLabel: 'Shared layer',
    privateLayerLabel: 'Private note',
  },
};

const seriesManageTextByLocale: Record<AppLocale, SeriesManageText> = {
  'zh-CN': {
    titleCreate: '新建作品',
    titleEdit: '编辑作品',
    seriesTitleLabel: '作品标题',
    seriesTitlePlaceholder: '输入作品标题',
    progressLabel: '已读进度章节号',
    progressPlaceholder: '例如：1098 或 番外',
    saveButton: '保存',
    deleteButton: '删除作品',
    saveSuccess: '已保存作品信息。',
    saveFailed: '保存失败，请重试。',
    deleteSuccess: '已删除作品。',
    deleteFailed: '删除失败，请重试。',
  },
  en: {
    titleCreate: 'Create series',
    titleEdit: 'Edit series',
    seriesTitleLabel: 'Series title',
    seriesTitlePlaceholder: 'Enter series title',
    progressLabel: 'Last read chapter number',
    progressPlaceholder: 'e.g. 1098 or Extra',
    saveButton: 'Save',
    deleteButton: 'Delete series',
    saveSuccess: 'Series saved.',
    saveFailed: 'Save failed. Please retry.',
    deleteSuccess: 'Series deleted.',
    deleteFailed: 'Delete failed. Please retry.',
  },
};

export const getSeriesDetailText = (locale: AppLocale): SeriesDetailText => {
  return seriesDetailTextByLocale[locale];
};

export const getChapterDetailText = (locale: AppLocale): ChapterDetailText => {
  return chapterDetailTextByLocale[locale];
};

export const getChapterCreateText = (locale: AppLocale): ChapterCreateText => {
  return chapterCreateTextByLocale[locale];
};

export const getImportScreenText = (locale: AppLocale): ImportScreenText => {
  return importScreenTextByLocale[locale];
};

export const getImportStrategyOptions = (locale: AppLocale): ImportStrategyOption[] => {
  return importStrategyOptionsByLocale[locale];
};

export const getSearchScreenText = (locale: AppLocale): SearchScreenText => {
  return searchScreenTextByLocale[locale];
};

export const getLibraryScreenText = (locale: AppLocale): LibraryScreenText => {
  return libraryScreenTextByLocale[locale];
};

export const getSettingsScreenText = (locale: AppLocale): SettingsScreenText => {
  return settingsScreenTextByLocale[locale];
};

export const getHomeScreenText = (locale: AppLocale): HomeScreenText => {
  return homeScreenTextByLocale[locale];
};

export const getNavigationText = (locale: AppLocale): NavigationText => {
  return navigationTextByLocale[locale];
};

export const getSeriesSharedText = (locale: AppLocale): SeriesSharedText => {
  return seriesSharedTextByLocale[locale];
};

export const getSeriesManageText = (locale: AppLocale): SeriesManageText => {
  return seriesManageTextByLocale[locale];
};
