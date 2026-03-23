# 🏛️ Amber Republic

**Shape Latvia's Future** — A political and economic simulation game set in modern Latvia.

You take the role of Latvia's leader, making decisions that shape the country's economy, demographics, security, society, and international standing. Every choice has trade-offs. Most consequences won't be obvious until it's too late.

## 🎮 Play

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## 🧠 What Makes This Game Interesting

- **Real data**: Starting conditions based on Latvia's actual 2025 statistics
- **No right answers**: Every decision involves painful trade-offs
- **Delayed consequences**: Most big decisions take 2-8 turns to fully manifest
- **Second-order effects**: High emigration → workforce shortage → GDP decline → more emigration
- **Humor**: Because governance is too important to take entirely seriously
- **Educational**: Learn about Latvia's real challenges: depopulation, brain drain, Russian minority integration, NATO obligations, EU politics, energy independence

## 🗺️ Key Themes

- **Demographics**: Latvia's population fell from 2.7M (1990) to 1.86M (2025). Can you reverse it?
- **Brain Drain**: 20,000 young people leave each year. For Dublin, Berlin, Stockholm.
- **Security**: NATO frontline state with Russia and Belarus on the border
- **Economy**: Ports lost Russian transit trade. Rail Baltica is late. The tech sector is growing.
- **Society**: Russian-speaking minority (24%), language policy, Song Festival tradition
- **Innovation**: MikroTīkls, biotech, fintech — can Latvia become the Silicon Baltic?

## 🏗️ Architecture

- **Engine**: Pure TypeScript, zero side effects, seeded RNG for reproducibility
- **Events**: Data-driven — adding new scenarios requires zero engine changes
- **UI**: React + Vite + Tailwind CSS
- **Design**: Glass morphism, amber gold accent, responsive

## 📁 Structure

```
src/
  engine/     — Core game loop (state, effects, events, turns)
  data/       — Event definitions by category
  ui/         — React components
```

## 🎯 Inspired By

- **Tropico** — The Caribbean dictator sim that started it all
- **Democracy** — Positech's political simulation
- **Real Latvia** — Wikipedia, IMF data, Baltic Times, LSM.lv

---

*Built with ❤️ and a healthy respect for the complexity of governing a small nation.*
