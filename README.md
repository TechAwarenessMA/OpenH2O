# OpenPrompt

**Know your AI footprint.** Upload your Claude `conversations.json` export and see the energy, water, and carbon impact of your AI usage.

Built by [Tech Awareness Association](https://www.techawarenessassociation.org), a student-founded nonprofit in Shrewsbury, MA.

## Features

- Estimates energy (kWh), water (L), and carbon (g CO₂) from your Claude conversations
- Fully client-side — your data never leaves your browser
- Per-conversation breakdown with sorting and search
- Monthly usage timeline chart
- Real-world comparisons (miles driven, water bottles, phone charges, etc.)
- Actionable tips for reducing your AI footprint
- Transparent methodology with source citations

## Local Development

```bash
npm install
npm run dev
```

The app runs at `http://127.0.0.1:5174/`.

## Build

```bash
npm run build
npm run preview
```

## How to Use

1. Go to [claude.ai](https://claude.ai) → Settings → Export Data
2. Download and unzip the export
3. Upload `conversations.json` to OpenPrompt
4. Explore your environmental impact

## Updating Coefficients

Coefficients are in `src/data/coefficients.js`. To update:

1. Edit the values and source citations
2. Bump the `VERSION` string
3. Update `METHODOLOGY.md` and the Methodology page if formulas change

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 4
- React Router 7
- Recharts (charts)
- gpt-tokenizer (token counting)
- lucide-react (icons)

## Privacy

- No backend, no server, no cookies
- All processing happens in-browser
- Closing the tab erases all data
- We never see, store, or transmit your conversations

## License

MIT
