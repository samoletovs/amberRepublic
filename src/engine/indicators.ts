import { IndicatorMeta } from './types';

export const INDICATORS: IndicatorMeta[] = [
  // Economy
  { key: 'gdp', name: 'GDP', description: 'Gross domestic product in billions EUR', emoji: '💰', category: 'economy', format: 'billions', min: 15, max: 120, goodDirection: 'up' },
  { key: 'gdpGrowth', name: 'GDP Growth', description: 'Annual GDP growth rate', emoji: '📈', category: 'economy', format: 'percent', min: -20, max: 15, goodDirection: 'up' },
  { key: 'unemployment', name: 'Unemployment', description: 'Unemployment rate', emoji: '👷', category: 'economy', format: 'percent', min: 1, max: 30, goodDirection: 'down' },
  { key: 'inflation', name: 'Inflation', description: 'Consumer price inflation rate', emoji: '🏷️', category: 'economy', format: 'percent', min: -2, max: 25, goodDirection: 'neutral' },
  { key: 'publicDebt', name: 'Public Debt', description: 'Government debt as % of GDP', emoji: '🏦', category: 'economy', format: 'percent', min: 5, max: 150, goodDirection: 'down' },
  { key: 'taxBurden', name: 'Tax Burden', description: 'Effective tax rate on economy', emoji: '🧾', category: 'economy', format: 'index', min: 10, max: 60, goodDirection: 'neutral' },
  { key: 'foreignInvestment', name: 'Foreign Investment', description: 'Attractiveness to foreign investors', emoji: '🌍', category: 'economy', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'energyIndependence', name: 'Energy Independence', description: 'Self-sufficiency in energy production', emoji: '⚡', category: 'economy', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'portActivity', name: 'Port & Transit', description: 'Activity at Riga, Ventspils & Liepāja ports', emoji: '🚢', category: 'economy', format: 'index', min: 0, max: 100, goodDirection: 'up' },

  // Demographics
  { key: 'population', name: 'Population', description: 'Total population of Latvia', emoji: '👥', category: 'demographics', format: 'millions', min: 1.0, max: 2.5, goodDirection: 'up' },
  { key: 'emigrationRate', name: 'Emigration', description: 'Rate of people leaving the country', emoji: '✈️', category: 'demographics', format: 'index', min: 0, max: 100, goodDirection: 'down' },
  { key: 'birthRate', name: 'Birth Rate', description: 'Fertility and family formation rate', emoji: '👶', category: 'demographics', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'russianMinorityIntegration', name: 'Minority Integration', description: 'Integration level of Russian-speaking minority', emoji: '🤝', category: 'demographics', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'workforceSkill', name: 'Workforce Skills', description: 'Education and skill level of workers', emoji: '🎓', category: 'demographics', format: 'index', min: 0, max: 100, goodDirection: 'up' },

  // Society
  { key: 'publicHappiness', name: 'Public Happiness', description: 'General population satisfaction', emoji: '😊', category: 'society', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'healthcareQuality', name: 'Healthcare', description: 'Quality and accessibility of healthcare', emoji: '🏥', category: 'society', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'educationQuality', name: 'Education', description: 'Quality of education system', emoji: '📚', category: 'society', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'corruptionLevel', name: 'Corruption', description: 'Level of corruption in government and business', emoji: '🕵️', category: 'society', format: 'index', min: 0, max: 100, goodDirection: 'down' },
  { key: 'mediaTrust', name: 'Media Trust', description: 'Public trust in media institutions', emoji: '📰', category: 'society', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'nationalIdentity', name: 'National Identity', description: 'Strength of Latvian cultural identity', emoji: '🇱🇻', category: 'society', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'socialCohesion', name: 'Social Cohesion', description: 'Unity and solidarity among citizens', emoji: '🫂', category: 'society', format: 'index', min: 0, max: 100, goodDirection: 'up' },

  // Security & Foreign Policy
  { key: 'natoRelations', name: 'NATO Relations', description: 'Strength of ties with NATO allies', emoji: '🛡️', category: 'security', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'euStanding', name: 'EU Standing', description: 'Influence and reputation within EU', emoji: '🇪🇺', category: 'security', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'russiaRelations', name: 'Russia Relations', description: 'State of relations with Russia (higher = less tense)', emoji: '🇷🇺', category: 'security', format: 'index', min: 0, max: 100, goodDirection: 'neutral' },
  { key: 'militaryReadiness', name: 'Military Readiness', description: 'Defence capability and preparedness', emoji: '🪖', category: 'security', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'cyberDefense', name: 'Cyber Defense', description: 'Protection against cyber threats', emoji: '🔒', category: 'security', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'borderSecurity', name: 'Border Security', description: 'Control over borders with Russia & Belarus', emoji: '🚧', category: 'security', format: 'index', min: 0, max: 100, goodDirection: 'up' },

  // Innovation
  { key: 'techSector', name: 'Tech Sector', description: 'Growth and vitality of technology industry', emoji: '💻', category: 'innovation', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'rdSpending', name: 'R&D Spending', description: 'Research and development as % of GDP', emoji: '🔬', category: 'innovation', format: 'percent', min: 0.2, max: 5, goodDirection: 'up' },
  { key: 'digitalInfra', name: 'Digital Infrastructure', description: 'Internet, 5G coverage, e-government', emoji: '📡', category: 'innovation', format: 'index', min: 0, max: 100, goodDirection: 'up' },
  { key: 'greenTransition', name: 'Green Transition', description: 'Progress toward renewable energy & sustainability', emoji: '🌿', category: 'innovation', format: 'index', min: 0, max: 100, goodDirection: 'up' },
];

export function getIndicatorMeta(key: string): IndicatorMeta | undefined {
  return INDICATORS.find(i => i.key === key);
}
