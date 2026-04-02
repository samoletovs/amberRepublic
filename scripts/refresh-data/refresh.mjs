#!/usr/bin/env node
/**
 * Amber Republic — Data Refresh Script
 * 
 * Fetches real Latvian data from multiple sources and uses AI to generate
 * new game events. Output is a TypeScript file ready to import.
 *
 * Usage:
 *   node scripts/refresh-data/refresh.mjs                    # Full refresh
 *   node scripts/refresh-data/refresh.mjs --source petitions # Single source
 *   node scripts/refresh-data/refresh.mjs --dry-run          # Fetch only, no AI
 *
 * Requires: .env or api/.env with AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_KEY
 *           (or OPENAI_API_KEY or ANTHROPIC_API_KEY)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  fetchPetitions,
  fetchCSPStats,
  fetchNewsHeadlines,
  fetchSaeimaData,
  fetchEurostatData,
} from './fetchers.mjs';
import { generateEvents } from './generator.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const sourceFilter = args.find(a => a.startsWith('--source='))?.split('=')[1]
  ?? (args.includes('--source') ? args[args.indexOf('--source') + 1] : null);

const SOURCES = {
  petitions: { fetch: fetchPetitions, label: '📜 Petitions (data.gov.lv)' },
  cspStats: { fetch: fetchCSPStats, label: '📊 CSP Statistics' },
  news: { fetch: fetchNewsHeadlines, label: '📰 News (LSM.lv)' },
  saeima: { fetch: fetchSaeimaData, label: '🏛️ Saeima (Parliament)' },
  eurostat: { fetch: fetchEurostatData, label: '🇪🇺 Eurostat' },
};

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  🏛️  Amber Republic — Data Refresh Pipeline');
  console.log('═══════════════════════════════════════════════\n');

  // Step 1: Fetch data from sources
  const sourcesToFetch = sourceFilter
    ? { [sourceFilter]: SOURCES[sourceFilter] }
    : SOURCES;

  if (sourceFilter && !SOURCES[sourceFilter]) {
    console.error(`Unknown source: ${sourceFilter}`);
    console.log(`Available: ${Object.keys(SOURCES).join(', ')}`);
    process.exit(1);
  }

  const realData = {};
  for (const [key, src] of Object.entries(sourcesToFetch)) {
    console.log(`Fetching ${src.label}...`);
    try {
      realData[key] = await src.fetch();
      console.log(`  ✓ Done`);
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}`);
    }
  }

  // Step 2: Display what we found
  console.log('\n── Raw Data Summary ──────────────────────────\n');
  if (realData.petitions) {
    console.log(`Petitions: ${realData.petitions.active.length} active, ${realData.petitions.completed.length} completed`);
    for (const p of realData.petitions.active) {
      console.log(`  📜 "${p.name}" — ${p.totalSignatures}/${p.requiredSignatures} signatures`);
    }
  }
  if (realData.news) {
    console.log(`News: ${realData.news.headlines.length} headlines`);
    for (const h of realData.news.headlines.slice(0, 5)) {
      console.log(`  📰 ${h.title}`);
    }
  }
  if (realData.cspStats) {
    console.log(`CSP Stats: ${Object.keys(realData.cspStats.stats).length} indicators`);
  }
  if (realData.saeima) {
    console.log(`Saeima: ${realData.saeima.items?.length ?? 0} items`);
  }
  if (realData.eurostat) {
    console.log(`Eurostat: ${realData.eurostat.indicators.length} indicators`);
  }

  // Save raw data snapshot
  const snapshotDir = resolve(PROJECT_ROOT, 'scripts/refresh-data/snapshots');
  mkdirSync(snapshotDir, { recursive: true });
  const snapshotFile = resolve(snapshotDir, `${new Date().toISOString().split('T')[0]}.json`);
  writeFileSync(snapshotFile, JSON.stringify(realData, null, 2));
  console.log(`\nSnapshot saved: ${snapshotFile}`);

  if (dryRun) {
    console.log('\n--dry-run: Skipping AI event generation');
    return;
  }

  // Step 3: Generate events via AI
  const events = await generateEvents(realData);
  if (events.length === 0) {
    console.error('\n✗ No events generated. Check your API keys.');
    return;
  }

  console.log(`\n✓ Generated ${events.length} events:`);
  for (const e of events) {
    console.log(`  [${e.category}] ${e.title}`);
  }

  // Step 4: Write TypeScript output
  const outputPath = resolve(PROJECT_ROOT, 'src/data/refreshed-events.ts');
  const tsContent = generateTypeScript(events);
  writeFileSync(outputPath, tsContent);
  console.log(`\n✓ Written to: ${outputPath}`);
  console.log('\nNext steps:');
  console.log('  1. Review the generated events in src/data/refreshed-events.ts');
  console.log('  2. Edit any events that need tweaking');
  console.log('  3. Events are auto-imported by src/data/index.ts');
}

function generateTypeScript(events) {
  const date = new Date().toISOString().split('T')[0];
  const eventsJson = JSON.stringify(events, null, 2)
    // Clean up JSON to be more TypeScript-idiomatic
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, "'");

  return `import type { GameEvent } from '../engine/types';

/**
 * Auto-generated events from real Latvian data.
 * Generated: ${date}
 * Sources: data.gov.lv petitions, LSM.lv news, CSP stats, Saeima, Eurostat
 *
 * Review and edit before committing!
 * Re-generate: node scripts/refresh-data/refresh.mjs
 */
export const refreshedEvents: GameEvent[] = ${eventsJson};
`;
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
