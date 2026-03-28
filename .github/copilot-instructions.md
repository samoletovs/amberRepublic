## Amber Republic Project

### Environment
- Azure subscription: Visual Studio Enterprise (samoletov@live.com)
- Azure region: northeurope
- GitHub: samoletovs/amberRepublic (private)

### Tech Stack
- React 19 + TypeScript + Vite + Tailwind CSS
- Azure Static Web Apps for hosting
- Azure Functions API (AI event generation, reality dashboard)

### Practices
- Game engine is pure functions — zero side effects
- All state is immutable (spread/structuredClone)
- Events are data-driven — engine doesn't know about Latvia, only indicators + effects
- Seeded RNG for reproducibility
- Commit frequently with clear messages
- Push to `master` branch on GitHub

### Style
- Warm parchment theme (cream #F5F0E8 background)
- Fonts: Lora (headings), Source Sans 3 (body), IBM Plex Mono (data)
- Primary: Latvian crimson #9E3039
- Accent: amber #B8860B
