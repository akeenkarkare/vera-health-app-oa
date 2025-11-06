# Vera Health App

mobile app for the vera health technical assignment

## Setup

Need node installed first

```bash
npm install
npm start
```

Need to have Expo Go installed on phone

Scan the QR code with your phone

## What it does

- streams responses from vera's API in real-time
- parses markdown
- shows those `<drug>` and `<guideline>` tags as collapsible sections
- displays search progress (the bonus feature with checkmarks)
- works on ios and android

## Structure

```
src/
  components/    - collapsible sections, markdown renderer, search progress
  screens/       - main chat screen
  services/      - SSE streaming stuff
  utils/         - markdown parser
  types/         - typescript types
```

## Running on device

**ios:**
```bash
npm run ios
```

**android:**
```bash
npm run android
```

**web** (for testing):
```bash
npm run web
```

## How It Works

Connects to `https://vera-assignment-api.vercel.app/api/stream` with SSE. Parses the response incrementally as chunks come in. The markdown parser looks for complete `<tag></tag>` pairs and renders them as collapsible sections.

## Tech Used

- expo sdk 54
- react native 0.81
- typescript
- react-native-markdown-display

## notes

Sometimes the API gives weird answers
