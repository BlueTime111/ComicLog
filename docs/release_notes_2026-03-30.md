# Release Notes - 2026-03-30

## 本次交付范围

- 搜索能力增强：支持展示命中字段（作品名、章节号、章节标题、总结、标签）。
- 搜索数据路径收敛：通过仓储层统一搜索入口，SQLite 走查询路径，避免全量内存过滤。
- 导入可靠性增强：SQLite 导入 `applyPack` 增加事务提交与失败回滚，防止部分写入。
- 搜索体验优化：命中字段使用标签样式展示，并增强异步竞态保护。

## 关键验证结果

- `npm test` 通过（105 tests）。
- `npx tsc --noEmit` 通过。
- `npx expo-doctor` 通过（17/17）。

## 运行时矩阵（Smoke）

已完成 `locale x data source` 四组合构建验证：

- `zh-CN + mock`
- `en + mock`
- `zh-CN + sqlite`
- `en + sqlite`

输出目录：

- `app/dist-smoke/zh-mock`
- `app/dist-smoke/en-mock`
- `app/dist-smoke/zh-sqlite`
- `app/dist-smoke/en-sqlite`

## 相关文档

- `README.md`
- `README-zh-CN.md`
- `docs/regression_matrix_2026-03-30.md`
