import { GameEvent } from '../engine/types';
import { economyEvents } from './economy-events';
import { securityEvents } from './security-events';
import { societyEvents } from './society-events';
import { diplomacyEvents, scienceEvents, crisisEvents } from './diplomacy-science-events';
import { extraEvents } from './extra-events';

export const ALL_EVENTS: GameEvent[] = [
  ...economyEvents,
  ...securityEvents,
  ...societyEvents,
  ...diplomacyEvents,
  ...scienceEvents,
  ...crisisEvents,
  ...extraEvents,
];
