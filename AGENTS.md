# AGENTS.md

## Project overview
This repository contains a mobile-first comic recap and sharing app.

Goals:
- Help users track comics they read
- Let users save one-line chapter summaries
- Let users review recent plot points quickly
- Support import/export of summary packs later

## Repository structure
- docs/: PRD, product specs, UI design notes, prompts
- designs/: UI screenshots and visual references
- app/: React Native Expo app

## Tech stack
- React Native
- Expo
- TypeScript
- Local-first architecture
- SQLite later, not in the first UI scaffold

## Coding rules
- Use functional components
- Use TypeScript everywhere
- Use StyleSheet, do not use external UI libraries unless explicitly requested
- Prefer small reusable components
- Keep UI state separate from data/repository logic
- Use mock data first before wiring real persistence

## Design rules
- This is a productivity tool, not a content streaming app
- Clean, card-based UI
- Prioritize readability and information density
- Summaries are important and must remain visible

## Workflow rules
- First build screens with mock data
- Then add navigation
- Then extract reusable components
- Then connect local persistence
- Do not implement backend or OCR in MVP

## Commands
- App lives in /app
- Install deps in /app
- Run app from /app
- If tests are added later, document and run them before finishing tasks
- Run tests: `npm test` (from `/app`)
- Run type check: `npx tsc --noEmit` (from `/app`)
- Run Expo checks: `npx expo-doctor` (from `/app`)

### Runtime flags
- `EXPO_PUBLIC_UI_LOCALE`: `zh-CN` (default) or `en`
  - PowerShell: `$env:EXPO_PUBLIC_UI_LOCALE='en'; npm run start`
  - cmd.exe: `set EXPO_PUBLIC_UI_LOCALE=en && npm run start`
  - bash: `EXPO_PUBLIC_UI_LOCALE=en npm run start`
- `EXPO_PUBLIC_DATA_SOURCE`: `mock` or `sqlite`

## What to read first
Before coding, read:
1. docs/prd.md
2. docs/product_spec.md
3. docs/ui_design.md
4. relevant images in designs/
