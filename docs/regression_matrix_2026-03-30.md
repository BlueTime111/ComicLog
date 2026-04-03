# Regression Matrix - 2026-03-30

## Scope

- Search result matched-fields UI polish
- Repository search path (SQLite and mock)
- Import transaction rollback safety (SQLite)

## Verification Commands

Run from `app/`:

```bash
npm test
npx tsc --noEmit
npx expo-doctor
```

Result:

- `npm test`: PASS (105 tests)
- `npx tsc --noEmit`: PASS
- `npx expo-doctor`: PASS (17/17)

## Runtime Matrix Smoke (Locale x Data Source)

All combinations exported successfully with web bundle smoke checks:

```bash
EXPO_PUBLIC_UI_LOCALE=zh-CN EXPO_PUBLIC_DATA_SOURCE=mock npx expo export --platform web --output-dir dist-smoke/zh-mock
EXPO_PUBLIC_UI_LOCALE=en EXPO_PUBLIC_DATA_SOURCE=mock npx expo export --platform web --output-dir dist-smoke/en-mock
EXPO_PUBLIC_UI_LOCALE=zh-CN EXPO_PUBLIC_DATA_SOURCE=sqlite npx expo export --platform web --output-dir dist-smoke/zh-sqlite
EXPO_PUBLIC_UI_LOCALE=en EXPO_PUBLIC_DATA_SOURCE=sqlite npx expo export --platform web --output-dir dist-smoke/en-sqlite
```

Generated folders:

- `app/dist-smoke/zh-mock`
- `app/dist-smoke/en-mock`
- `app/dist-smoke/zh-sqlite`
- `app/dist-smoke/en-sqlite`

## Notes

- This matrix confirms build-level compatibility for runtime flags.
- Browser interaction-level QA is not included in this report.
