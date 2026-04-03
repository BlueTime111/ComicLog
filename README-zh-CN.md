# ComicLog

ComicLog 是一款移动优先的漫画进度追踪与剧情回顾应用（React Native + Expo）。

> English version: `README.md`

## 项目简介

针对连载漫画阅读场景，ComicLog 提供“进度 + 一句话总结 + 私人补充”的组合体验，帮助你在断更或补番时快速找回剧情上下文。

## 功能介绍

- 追踪作品与章节阅读进度
- 记录章节共享总结（一句话）
- 记录章节私人补充（仅自己可见）
- 查看合并预览（共享在前，私人在后）
- 按作品/章节/关键词搜索摘要
- 导入与导出总结包（JSON）
- 书库支持按最近打开时间排序
- 本地优先运行（`mock` / `sqlite`）

## 截图（可选）

建议在 `designs/` 目录补充并在此展示：

- 首页
- 书库
- 章节详情
- 导入页

## 技术栈

- React Native
- Expo
- TypeScript
- React Navigation
- Expo SQLite

## 仓库结构

- `app/`：Expo React Native 应用（TypeScript）
- `docs/`：PRD、产品说明、设计文档
- `designs/`：视觉参考与截图

## 使用方式

在 `app/` 目录执行：

```bash
npm install
npm run start
```

运行到不同平台：

```bash
npm run android
npm run ios
npm run web
```

## 运行时参数

- `EXPO_PUBLIC_UI_LOCALE`：`zh-CN`（默认）或 `en`
- `EXPO_PUBLIC_DATA_SOURCE`：`mock` 或 `sqlite`
- `EXPO_PUBLIC_SQLITE_SEED`：`on`（默认）或 `off`

示例：

```powershell
$env:EXPO_PUBLIC_UI_LOCALE='en'; npm run start
```

```powershell
$env:EXPO_PUBLIC_DATA_SOURCE='sqlite'; $env:EXPO_PUBLIC_SQLITE_SEED='off'; npm run start
```

```cmd
set EXPO_PUBLIC_UI_LOCALE=en && npm run start
```

```bash
EXPO_PUBLIC_UI_LOCALE=en npm run start
```

## 验证命令

在 `app/` 目录执行：

```bash
npm test
npx tsc --noEmit
npx expo-doctor
```

## 路线图（MVP）

- [x] Mock 数据驱动的基础 UI
- [x] 首页/书库/详情核心流程
- [x] 导入导出 JSON 总结包
- [x] SQLite 仓储路径与本地化存储
- [ ] 完善发布与分发文档

## 贡献

1. Fork 仓库
2. 新建功能分支
3. 运行测试与类型检查
4. 提交 PR

## 相关文档

- `AGENTS.md`
- `docs/prd.md`
- `docs/product_spec.md`
- `docs/ui_design.md`
