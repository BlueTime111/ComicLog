import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getChapterCreateText,
  getChapterDetailText,
  getHomeScreenText,
  getImportScreenText,
  getImportStrategyOptions,
  getLibraryScreenText,
  getNavigationText,
  getSeriesManageText,
  getSearchScreenText,
  getSeriesDetailText,
  getSeriesSharedText,
  getSettingsScreenText,
} from './screenText';

test('getSeriesDetailText 返回英文详情页关键文案', () => {
  const text = getSeriesDetailText('en');

  assert.equal(text.loadingSeries, 'Loading series...');
  assert.equal(text.readProgressPrefix, 'Read progress: Ch. ');
  assert.equal(text.exportScopeReadOnly, 'Read chapters only');
  assert.equal(text.exportScopeIncludeUnread, 'Unread chapters only');
  assert.equal(text.exportSharedPackButton, 'Export shared JSON');
  assert.equal(text.exportGeneratedReadOnly('demo.json'), 'Export ready (read chapters only): demo.json');
});

test('getSeriesDetailText 返回中文详情页关键文案', () => {
  const text = getSeriesDetailText('zh-CN');

  assert.equal(text.loadingSeries, 'Loading series...');
  assert.equal(text.readProgressPrefix, '已读进度：Ch. ');
  assert.equal(text.exportScopeReadOnly, '仅已读章节');
  assert.equal(text.exportScopeIncludeUnread, '仅未读章节');
  assert.equal(text.exportSharedPackButton, '导出共享层 JSON');
  assert.equal(text.exportGeneratedIncludeUnread('demo.json'), '已生成导出内容（含未读章节）：demo.json');
});

test('getChapterDetailText 返回英文章节页关键文案', () => {
  const text = getChapterDetailText('en');

  assert.equal(text.sharedSummaryTitle, 'Shared summary');
  assert.equal(text.sharedPlaceholder, 'No shared summary yet (optional)');
  assert.equal(text.privateNotesTitle, 'My notes');
  assert.equal(text.saveButtonSaving, 'Saving...');
  assert.equal(text.saveNoChanges, 'Save failed or no changes detected.');
  assert.equal(text.combinedPreviewHint, 'Shared layer appears first, then your private note.');
  assert.equal(text.previewSharedLabel, 'Shared layer');
  assert.equal(text.previewPrivateLabel, 'Private note');
  assert.equal(text.previewPrivateEmpty, 'No private note yet.');
  assert.equal(text.readStatusCheckedLabel, 'Read');
  assert.equal(text.readStatusUncheckedLabel, 'Mark as read');
  assert.equal(text.readStatusToggleFailed, 'Failed to update read status.');
});

test('getChapterDetailText 返回中文章节页关键文案', () => {
  const text = getChapterDetailText('zh-CN');

  assert.equal(text.sharedSummaryTitle, '共享总结');
  assert.equal(text.sharedPlaceholder, '暂无共享总结（可选）');
  assert.equal(text.privateNotesTitle, '我的补充');
  assert.equal(text.saveButtonSaving, '保存中...');
  assert.equal(text.saveSuccess, '已保存章节总结。');
  assert.equal(text.combinedPreviewHint, '按最终阅读顺序展示：共享层在前，私人补充在后。');
  assert.equal(text.previewSharedLabel, '共享');
  assert.equal(text.previewPrivateLabel, '我的补充');
  assert.equal(text.previewPrivateEmpty, '暂无私人补充。');
  assert.equal(text.readStatusCheckedLabel, '已读');
  assert.equal(text.readStatusUncheckedLabel, '标记为已读');
  assert.equal(text.readStatusToggleFailed, '更新已读状态失败。');
});

test('getImportScreenText 返回英文导入页关键文案', () => {
  const text = getImportScreenText('en');
  const strategies = getImportStrategyOptions('en');

  assert.equal(text.title, '');
  assert.equal(text.previewButton, 'Parse and preview');
  assert.equal(text.conflictTitle, 'Conflict details');
  assert.equal(strategies[0]?.label, 'Import missing chapters only');
});

test('getImportScreenText 返回中文导入页关键文案', () => {
  const text = getImportScreenText('zh-CN');
  const strategies = getImportStrategyOptions('zh-CN');

  assert.equal(text.title, '');
  assert.equal(text.previewButton, '解析并预览');
  assert.equal(text.conflictTitle, '冲突章节明细');
  assert.equal(strategies[1]?.label, '覆盖共享层');
});

test('getSearchScreenText 返回英文搜索页关键文案', () => {
  const text = getSearchScreenText('en');

  assert.equal(text.title, 'Search');
  assert.equal(text.loadingHint, 'Loading local index...');
  assert.equal(text.emptyTitle, 'No matching results');
  assert.equal(text.matchedFieldsPrefix, 'Matched fields');
  assert.equal(text.matchedFieldTag, 'Tag');
});

test('getSearchScreenText 返回中文搜索页命中字段文案', () => {
  const text = getSearchScreenText('zh-CN');

  assert.equal(text.matchedFieldsPrefix, '命中字段');
  assert.equal(text.matchedFieldSeriesTitle, '作品名');
  assert.equal(text.matchedFieldSummary, '总结');
});

test('getLibraryScreenText 返回中文书库页关键文案', () => {
  const text = getLibraryScreenText('zh-CN');

  assert.equal(text.title, '书库');
  assert.equal(text.loadingHint, '加载中...');
  assert.equal(text.emptyTitle, '暂无作品');
  assert.equal(text.emptyDescription, '点击上方新建，创建第一部作品');
  assert.equal(text.emptyCreateButton, '新建作品');
  assert.equal(text.createButton, '新建');
  assert.equal(text.importButton, '导入');
  assert.equal(text.sortRecentFirst, '由近到远');
  assert.equal(text.sortOldestFirst, '由远到近');
  assert.equal(text.chapterCountLabel, '章节');
  assert.equal('importLogsTitle' in text, false);
});

test('getSettingsScreenText 返回英文设置页关键文案', () => {
  const text = getSettingsScreenText('en');

  assert.equal(text.title, 'Settings');
  assert.equal(text.description, 'Check runtime status.');
  assert.equal('importHistoryTitle' in text, false);
  assert.equal(text.runtimeInfoTitle, 'Runtime info');
  assert.equal(text.runtimeResolvedSourceLabel, 'Resolved data source');
  assert.equal(text.aboutTitle, 'About');
  assert.equal(
    text.aboutDescription,
    'ComicLog helps you track comic reading progress, save one-line chapter recaps, and quickly review plot points.',
  );
});

test('getSettingsScreenText 返回中文设置页关键文案', () => {
  const text = getSettingsScreenText('zh-CN');

  assert.equal(text.title, '设置');
  assert.equal(text.description, '检查当前运行状态。');
  assert.equal('importHistoryTitle' in text, false);
  assert.equal(text.runtimeInfoTitle, '运行时信息');
  assert.equal(text.runtimeConfiguredSourceLabel, '配置数据源');
  assert.equal(text.aboutDescription, 'ComicLog 是一款帮助你追踪漫画阅读进度、记录章节一句话总结并快速回顾剧情的工具。');
});

test('getHomeScreenText 返回中文首页关键文案', () => {
  const text = getHomeScreenText('zh-CN');

  assert.equal(text.recentlyViewedTitle, '最近阅读');
  assert.equal('recentlyViewedActionLabel' in text, false);
  assert.equal(text.segmentTracking, '追更中');
  assert.equal(text.importButton, '导入');
  assert.equal(text.topCreateButton, '新建');
  assert.equal(text.topSearchPlaceholder, '搜索作品或一句话总结');
  assert.equal(text.topSearchCancelButton, '取消');
  assert.equal(text.inlineSearchEmptyStateText, '没有匹配结果。');
  assert.equal(text.progressLabelPrefix, '进度: Ch. ');
});

test('getNavigationText 返回英文导航标题', () => {
  const text = getNavigationText('en');

  assert.equal(text.tabHome, 'Home');
  assert.equal(text.tabLibrary, 'Library');
  assert.equal(text.stackImport, 'Import');
  assert.equal(text.stackSeriesDetail, 'Series Detail');
});

test('getSeriesSharedText 返回中文回顾与查看文案', () => {
  const text = getSeriesSharedText('zh-CN');

  assert.equal(text.recapTitle, '读前回顾');
  assert.equal(text.previousChapterPrefix, '上一话');
  assert.equal(text.recentThreeTitle, '最近三话');
  assert.equal(text.chapterRowViewHint, '查看');
  assert.equal(text.sharedLayerLabel, '共享');
  assert.equal(text.privateLayerLabel, '我的');
});

test('getHomeScreenText 返回英文空状态按钮文案', () => {
  const text = getHomeScreenText('en');

  assert.equal(text.emptyPrimaryImportButton, 'Import pack');
  assert.equal(text.emptySecondaryCreateButton, 'Create series');
  assert.equal(text.topSearchPlaceholder, 'Search series or recap');
  assert.equal(text.topSearchCancelButton, 'Cancel');
  assert.equal(text.inlineSearchEmptyStateText, 'No matching comics.');
  assert.equal(text.progressLabelPrefix, 'Progress: Ch. ');
});

test('getNavigationText 返回中文管理页标题', () => {
  const text = getNavigationText('zh-CN');

  assert.equal(text.stackImport, '导入');
  assert.equal(text.stackSeriesManage, '作品管理');
});

test('getSeriesManageText 返回英文章段', () => {
  const text = getSeriesManageText('en');

  assert.equal(text.titleCreate, 'Create series');
  assert.equal(text.titleEdit, 'Edit series');
  assert.equal(text.saveButton, 'Save');
  assert.equal(text.deleteButton, 'Delete series');
});

test('getNavigationText 返回英文新增章节标题', () => {
  const text = getNavigationText('en');

  assert.equal(text.stackChapterCreate, 'Add Chapter');
});

test('getChapterCreateText 返回中文新增章节文案', () => {
  const text = getChapterCreateText('zh-CN');

  assert.equal(text.title, '新增章节');
  assert.equal(text.chapterNumberLabel, '章节号');
  assert.equal(text.chapterSummaryLabel, '我的一句话总结');
  assert.equal(text.saveButton, '保存章节');
});
