# ComicLog

Mobile-first comic recap and tracking app built with React Native + Expo.

> Chinese version: `README-zh-CN.md`

## Why ComicLog

ComicLog helps readers keep long-running stories organized by combining progress tracking and chapter-level recap notes.

## Features

- Track series and chapter reading progress
- Save one-line shared chapter summaries
- Add private personal notes per chapter
- Preview combined recap (shared + private)
- Search summaries by series/chapter/text
- Import and export summary packs (JSON)
- Sort library by recently opened time
- Local-first runtime with `mock` and `sqlite` data sources

## Screenshots

- Add project screenshots in `designs/`
- Suggested section names:
  - Home
  - Library
  - Chapter Detail
  - Import

## Tech Stack

- React Native
- Expo
- TypeScript
- React Navigation
- Expo SQLite

## Repository Structure

- `app/` - Expo React Native application (TypeScript)
- `docs/` - PRD, product specs, and notes
- `designs/` - visual references and screenshots

## Quick Start

Run all commands in `app/`:

```bash
npm install
npm run start
```

## Run on Device

```bash
npm run android
npm run ios
npm run web
```

## Environment Flags

- `EXPO_PUBLIC_UI_LOCALE`: `zh-CN` (default) or `en`
- `EXPO_PUBLIC_DATA_SOURCE`: `mock` or `sqlite`
- `EXPO_PUBLIC_SQLITE_SEED`: `on` (default) or `off`

Examples:

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

## Testing and Verification

Run in `app/`:

```bash
npm test
npx tsc --noEmit
npx expo-doctor
```

## Roadmap (MVP)

- [x] Mock-first UI scaffold
- [x] Core navigation and chapter detail flow
- [x] Import/export JSON packs
- [x] SQLite repository path
- [ ] Better release packaging and deployment docs

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run tests and type checks
4. Open a pull request

## Related Docs

- `AGENTS.md`
- `docs/prd.md`
- `docs/product_spec.md`
- `docs/ui_design.md`
