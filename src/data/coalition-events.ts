import { GameEvent } from '../engine/types';

/**
 * Coalition dynamics events — fire based on coalition loyalty thresholds.
 * These use a virtual `coalitionStability` indicator set by the turn engine:
 *   0 = fragile (loyalty < 30), 1 = shaky (loyalty 30-50), 2 = stable (> 50)
 */

export const coalitionEvents: GameEvent[] = [
  // ── FRAGILE COALITION (loyalty < 30) ───────────────────────
  {
    id: 'coalition_ultimatum',
    title: '⚠️ Coalition Ultimatum',
    description: 'Your smallest coalition partner has called an emergency meeting. Their leader arrives with a one-page document: "Meet these demands by next quarter, or we walk." The media has already picked up rumors of a split.',
    preconditions: [{ indicator: 'coalitionStability', op: '<=', value: 0 }],
    category: 'society', weight: 14, oneTime: false,
    choices: [
      {
        label: 'Accept their demands — preserve unity',
        description: 'Give in to keep the coalition together. It will cost political capital and budget.',
        effects: [
          { indicator: 'publicDebt', delta: 1.5, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: 1, delay: 0, duration: 2 },
          { indicator: 'foreignInvestment', delta: -1, delay: 1, duration: 0 },
        ],
        humor: 'You sign the paper. Your finance minister sighs so loud it echoes through the corridor.',
      },
      {
        label: 'Counter-offer — negotiate a compromise',
        description: 'Meet them halfway. Risky — they might see it as weakness or good faith.',
        effects: [
          { indicator: 'publicDebt', delta: 0.8, delay: 0, duration: 0 },
          { indicator: 'mediaTrust', delta: 1, delay: 0, duration: 2 },
        ],
        humor: '"Compromise" in politics means both sides leave equally unhappy.',
      },
      {
        label: 'Call their bluff — dare them to leave',
        description: 'Tell them to walk if they want. You\'ll find new partners.',
        effects: [
          { indicator: 'publicHappiness', delta: -2, delay: 0, duration: 3 },
          { indicator: 'socialCohesion', delta: -2, delay: 0, duration: 2 },
          { indicator: 'foreignInvestment', delta: 1, delay: 1, duration: 0 },
        ],
        humor: 'Your poker face is legendary. Your blood pressure is not.',
      },
    ],
  },
  {
    id: 'coalition_leak',
    title: '📰 Coalition Partner Leaks Cabinet Secrets',
    description: 'Confidential cabinet discussions about a sensitive policy have appeared in Neatkarīgā newspaper. The leak clearly came from one of your coalition partners, trying to undermine your position before the public.',
    preconditions: [{ indicator: 'coalitionStability', op: '<=', value: 0 }],
    category: 'society', weight: 10, oneTime: true,
    choices: [
      {
        label: 'Confront the partner privately',
        description: 'Demand an explanation behind closed doors. Preserve coalition unity publicly.',
        effects: [
          { indicator: 'mediaTrust', delta: -1, delay: 0, duration: 2 },
          { indicator: 'socialCohesion', delta: -1, delay: 0, duration: 2 },
        ],
        humor: 'Private conversations in Latvian politics stay private for about 47 minutes.',
      },
      {
        label: 'Go public — condemn the leak',
        description: 'Hold a press conference denouncing the breach of trust. Public showdown.',
        effects: [
          { indicator: 'mediaTrust', delta: 2, delay: 0, duration: 3 },
          { indicator: 'socialCohesion', delta: -3, delay: 0, duration: 3 },
          { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 2 },
        ],
        humor: 'The coalition is now a reality show. Latvia watches with popcorn.',
      },
      {
        label: 'Ignore it — focus on policy',
        description: 'Rise above the drama. Let the story die naturally.',
        effects: [
          { indicator: 'mediaTrust', delta: -2, delay: 0, duration: 3 },
          { indicator: 'publicHappiness', delta: 1, delay: 0, duration: 1 },
        ],
        humor: '"No comment" — the most commented-upon phrase in political history.',
      },
    ],
  },

  // ── SHAKY COALITION (loyalty 30-50) ────────────────────────
  {
    id: 'coalition_policy_clash',
    title: '🏛️ Coalition Policy Clash',
    description: 'Your coalition partners disagree on a key piece of legislation. The Greens want stricter environmental regulations; the centrists want business-friendly deregulation. The vote is next week and both sides are lobbying you hard.',
    preconditions: [
      { indicator: 'coalitionStability', op: '<=', value: 1 },
      { indicator: 'coalitionStability', op: '>=', value: 0 },
    ],
    category: 'economy', weight: 11, oneTime: false,
    choices: [
      {
        label: 'Side with the Greens — environmental standards',
        description: 'Pass strict regulations. Good for green transition, bad for quick growth.',
        effects: [
          { indicator: 'greenTransition', delta: 4, delay: 0, duration: 0 },
          { indicator: 'foreignInvestment', delta: -2, delay: 1, duration: 0 },
          { indicator: 'gdpGrowth', delta: -0.3, delay: 1, duration: 3 },
        ],
        humor: 'Trees are happy. Factory owners are not.',
      },
      {
        label: 'Side with the centrists — deregulation',
        description: 'Open up markets. Business booms, but at environmental cost.',
        effects: [
          { indicator: 'foreignInvestment', delta: 3, delay: 0, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.4, delay: 1, duration: 3 },
          { indicator: 'greenTransition', delta: -3, delay: 0, duration: 0 },
        ],
        humor: 'The invisible hand of the market is also invisible to environmental inspectors.',
      },
      {
        label: 'Draft a compromise bill',
        description: 'Create a watered-down version that nobody loves but everyone can live with.',
        effects: [
          { indicator: 'greenTransition', delta: 1, delay: 0, duration: 0 },
          { indicator: 'foreignInvestment', delta: 1, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 2 },
        ],
        humor: 'The bill pleases no one. Which means it\'s probably good legislation.',
      },
    ],
  },
  {
    id: 'coalition_partner_scandal',
    title: '💥 Coalition Partner Embroiled in Scandal',
    description: 'A senior minister from one of your coalition parties has been caught in a corruption scandal. KNAB is investigating. The opposition demands their resignation. Your partner insists it\'s a political hit job.',
    preconditions: [
      { indicator: 'coalitionStability', op: '<=', value: 1 },
      { indicator: 'corruptionLevel', op: '>=', value: 35 },
    ],
    category: 'society', weight: 9, oneTime: true,
    choices: [
      {
        label: 'Demand the minister\'s resignation',
        description: 'Side with the investigation. Your partner will remember this.',
        effects: [
          { indicator: 'corruptionLevel', delta: -3, delay: 0, duration: 0 },
          { indicator: 'mediaTrust', delta: 3, delay: 0, duration: 3 },
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 2 },
        ],
        humor: 'One less corrupt official. Only a few hundred more to go.',
      },
      {
        label: 'Shield your partner — coalition first',
        description: 'Support your ally publicly. Claim the investigation is politically motivated.',
        effects: [
          { indicator: 'corruptionLevel', delta: 3, delay: 0, duration: 0 },
          { indicator: 'mediaTrust', delta: -4, delay: 0, duration: 3 },
          { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 3 },
          { indicator: 'euStanding', delta: -2, delay: 1, duration: 0 },
        ],
        humor: 'Latvian voters have long memories. And journalists have even longer ones.',
      },
      {
        label: 'Stay neutral — let institutions work',
        description: 'Say you trust KNAB to do their job. Neither defend nor attack.',
        effects: [
          { indicator: 'corruptionLevel', delta: -1, delay: 0, duration: 0 },
          { indicator: 'mediaTrust', delta: 1, delay: 0, duration: 2 },
        ],
        humor: 'The "Let institutions work" approach. Works great until institutions don\'t.',
      },
    ],
  },

  // ── COALITION REFORMATION ──────────────────────────────────
  {
    id: 'coalition_new_partner_offer',
    title: '🤝 Opposition Party Offers to Join Coalition',
    description: 'An opposition party has approached you privately. They\'re willing to join the coalition — with conditions. They want a ministry and a say in budget priorities. It would strengthen your majority.',
    preconditions: [{ indicator: 'coalitionStability', op: '<=', value: 1 }],
    category: 'diplomacy', weight: 8, oneTime: false,
    choices: [
      {
        label: 'Welcome them in — expand the coalition',
        description: 'Accept the new partner. More seats, more stability, but more competing voices.',
        effects: [
          { indicator: 'publicHappiness', delta: 1, delay: 0, duration: 2 },
          { indicator: 'socialCohesion', delta: 2, delay: 0, duration: 3 },
          { indicator: 'foreignInvestment', delta: 1, delay: 1, duration: 0 },
        ],
        humor: 'Your cabinet meetings just got 40 minutes longer.',
      },
      {
        label: 'Decline — don\'t dilute the coalition',
        description: 'Keep the current team. Too many parties means too many compromises.',
        effects: [
          { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 2 },
          { indicator: 'foreignInvestment', delta: -1, delay: 0, duration: 2 },
        ],
        humor: '"We\'re fine as we are," you say, hoping nobody checks the loyalty numbers.',
      },
    ],
  },
];
