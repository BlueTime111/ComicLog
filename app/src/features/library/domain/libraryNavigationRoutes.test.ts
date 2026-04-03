import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getLibraryCreateRoute,
  getLibraryImportRoute,
  getLibrarySeriesDetailRoute,
} from './libraryNavigationRoutes';

test('getLibraryCreateRoute 返回书库栈内新建页面路由', () => {
  assert.deepEqual(getLibraryCreateRoute(), {
    name: 'SeriesManage',
    params: undefined,
  });
});

test('getLibraryImportRoute 返回书库栈内导入页面路由', () => {
  assert.deepEqual(getLibraryImportRoute(), {
    name: 'Import',
    params: undefined,
  });
});

test('getLibrarySeriesDetailRoute 返回书库栈内作品详情路由', () => {
  assert.deepEqual(getLibrarySeriesDetailRoute('one-piece'), {
    name: 'SeriesDetail',
    params: { seriesId: 'one-piece' },
  });
});
