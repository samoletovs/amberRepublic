import { GameEvent } from '../engine/types';
import { economyEvents } from './economy-events';
import { securityEvents } from './security-events';
import { societyEvents } from './society-events';
import { diplomacyEvents, scienceEvents, crisisEvents } from './diplomacy-science-events';
import { extraEvents } from './extra-events';
import { regionalEvents, tradeEvents, crimeEvents, seasonalEvents } from './csp-events';
import { electionCampaignEvents } from './election-events';
import { coalitionEvents } from './coalition-events';
import { petitionEvents } from './petition-events';
import { refreshedEvents } from './refreshed-events';

export { ELECTION_FLAVOR } from './election-events';

export const ALL_EVENTS: GameEvent[] = [
  ...economyEvents,
  ...securityEvents,
  ...societyEvents,
  ...diplomacyEvents,
  ...scienceEvents,
  ...crisisEvents,
  ...extraEvents,
  ...regionalEvents,
  ...tradeEvents,
  ...crimeEvents,
  ...seasonalEvents,
  ...electionCampaignEvents,
  ...coalitionEvents,
  ...petitionEvents,
  ...refreshedEvents,
];
