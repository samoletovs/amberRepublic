import { useState, useCallback, useEffect } from 'react';
import { GameState, GameEvent } from './engine/types';
import { createInitialState } from './engine/state';
import { startTurn, resolveTurn } from './engine/turn';
import { applyBudgetAllocationEffects, applyIndicatorOverrides } from './engine/startAdjustments';
import { INDICATORS } from './engine/indicators';
import { applyTraitStartBias, type TraitId } from './engine/traits';
import { applyTraitFactionBias } from './engine/factions';
import { advancePillar, type PillarId } from './engine/constitution';
import { resolveDemand } from './engine/superpowers';
import { enactDecree, revokeDecree } from './engine/decrees';
import { ALL_EVENTS } from './data';
import { generateAIEvent, evaluateCustomChoice, getAvailableModels, type AIModel } from './engine/ai';
import { saveAiEvent, pickSavedEvent } from './engine/savedEvents';
import { fetchDynamicStartData, fetchHistoricalData, type HistoricalScenario, HISTORICAL_SCENARIOS } from './engine/latviaData';
import TitleScreen from './ui/TitleScreen';
import OnboardingScreen from './ui/OnboardingScreen';
import ManifestoScreen from './ui/ManifestoScreen';
import GameScreen from './ui/GameScreen';
import GameOverScreen from './ui/GameOverScreen';
import QuizScreen from './ui/QuizScreen';
import BudgetScreen from './ui/BudgetScreen';
import RealityDashboard from './ui/RealityDashboard';
import ElectionResultsScreen from './ui/ElectionResultsScreen';

type Screen = 'title' | 'onboarding' | 'manifesto' | 'game' | 'gameover' | 'quiz' | 'budget' | 'reality' | 'election';

// Screens that can be navigated to via URL hash
const HASH_SCREENS: Record<string, Screen> = {
  '#quiz': 'quiz',
  '#reality': 'reality',
  '#game': 'game',
  '#onboarding': 'onboarding',
};

function getScreenFromHash(): Screen {
  return HASH_SCREENS[window.location.hash] || 'title';
}

export default function App() {
  const [screen, setScreenRaw] = useState<Screen>(getScreenFromHash);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([]);
  const [decisions, setDecisions] = useState<Map<string, number>>(new Map());
  const [aiMode, setAiMode] = useState(false);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);
  const [pendingState, setPendingState] = useState<GameState | null>(null);

  // Wrap setScreen to also push browser history
  const setScreen = useCallback((next: Screen) => {
    setScreenRaw(next);
    const hash = Object.entries(HASH_SCREENS).find(([, v]) => v === next)?.[0] || '';
    if (next === 'title') {
      // Remove hash when going home
      if (window.location.hash) window.history.pushState(null, '', window.location.pathname);
    } else if (hash) {
      window.history.pushState(null, '', hash);
    }
  }, []);

  // Listen for browser back/forward button
  useEffect(() => {
    const handlePop = () => {
      const s = getScreenFromHash();
      setScreenRaw(s);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Check available AI models on mount
  useEffect(() => {
    fetch('/api/track-login', { method: 'POST' }).catch(() => {});
    getAvailableModels().then(({ models }) => {
      setAiModels(models);
      if (models.length > 0) setSelectedModel(models[0].id);
    });
  }, []);

  const generateEvents = useCallback(async (state: GameState): Promise<{ events: GameEvent[]; nextState: GameState }> => {
    const { state: nextState, events: staticEvents } = startTurn(state, ALL_EVENTS);

    if (!aiMode || aiModels.length === 0) {
      return { events: staticEvents, nextState };
    }

    // Hybrid: 1 static + 1 AI-generated event
    setAiLoading(true);
    try {
      const recentTitles = state.history
        .slice(-5)
        .flatMap(h => h.events.map(e => e.event.title));
      const saved = pickSavedEvent(state, recentTitles);
      if (saved) {
        return { events: [staticEvents[0], saved].filter(Boolean), nextState };
      }

      const aiEvent = await generateAIEvent(state, selectedModel);
      if (aiEvent) {
        return { events: [staticEvents[0], aiEvent as GameEvent].filter(Boolean), nextState };
      }
    } catch {
      // Fallback to all static
    } finally {
      setAiLoading(false);
    }
    return { events: staticEvents, nextState };
  }, [aiMode, aiModels, selectedModel]);

  const handleStartGame = useCallback(async (scenario?: HistoricalScenario) => {
    let state = createInitialState();

    // Fetch real data to override starting conditions
    try {
      const overrides = scenario
        ? await fetchHistoricalData(scenario.year)
        : await fetchDynamicStartData();
      state = {
        ...state,
        indicators: applyIndicatorOverrides(state.indicators, overrides),
      };
      if (scenario) {
        state = { ...state, year: scenario.year };
      }
    } catch {
      // Fall back to hardcoded values
    }

    setPendingState(state);
    setScreen('onboarding');
  }, []);

  const handleTraitsConfirm = useCallback((traits: TraitId[]) => {
    const state = pendingState;
    if (!state) return;
    const biased = {
      ...state,
      traits,
      indicators: applyTraitStartBias(state.indicators, traits),
      factionApproval: applyTraitFactionBias(state.factionApproval, traits),
    };
    setPendingState(biased);
    setScreen('manifesto');
  }, [pendingState]);

  const handleManifestoConfirm = useCallback((promiseIds: string[]) => {
    const state = pendingState;
    if (!state) return;
    const termIndex = state.parliament.electionHistory.length; // 0 for first term
    const biased = {
      ...state,
      promises: [
        ...state.promises,
        ...promiseIds.map(id => ({ promiseId: id, termIndex })),
      ],
    };
    setPendingState(biased);
    setScreen('budget');
  }, [pendingState]);

  const handleBudgetAllocate = useCallback(async (allocations: Record<string, number>) => {
    const state = pendingState;
    if (!state) return;

    const nextState = {
      ...state,
      indicators: applyBudgetAllocationEffects(state.indicators, allocations),
    };

    setGameState(nextState);
    const { events, nextState: turnState } = await generateEvents(nextState);
    setGameState(turnState);
    setCurrentEvents(events);
    setDecisions(new Map());
    setScreen('game');
  }, [pendingState, generateEvents]);

  const handleBudgetSkip = useCallback(async () => {
    const state = pendingState;
    if (!state) return;
    const nextState = { ...state, indicators: { ...state.indicators } };
    setGameState(nextState);
    const { events, nextState: turnState } = await generateEvents(nextState);
    setGameState(turnState);
    setCurrentEvents(events);
    setDecisions(new Map());
    setScreen('game');
  }, [pendingState, generateEvents]);

  const handleMakeChoice = useCallback((eventId: string, choiceIndex: number) => {
    setDecisions(prev => {
      const next = new Map(prev);
      next.set(eventId, choiceIndex);
      return next;
    });
  }, []);

  const handleCustomResponse = useCallback(async (eventId: string, customText: string) => {
    if (!gameState) return;
    const event = currentEvents.find(e => e.id === eventId);
    if (!event) return;

    setAiLoading(true);
    try {
      const evaluation = await evaluateCustomChoice(
        event.title,
        event.description,
        customText,
        gameState.indicators,
        selectedModel,
      );

      if (evaluation) {
        const newChoice = {
          label: evaluation.label,
          description: evaluation.description,
          effects: evaluation.effects,
          humor: evaluation.humor,
        };

        const updatedEvent = {
          ...event,
          choices: [...event.choices, newChoice],
        };

        setCurrentEvents(prev =>
          prev.map(e => (e.id === eventId ? updatedEvent : e))
        );

        // Auto-select the custom choice
        setDecisions(prev => {
          const next = new Map(prev);
          next.set(eventId, updatedEvent.choices.length - 1);
          return next;
        });
      }
    } catch {
      // Silent fail — user can still pick predefined choices
    } finally {
      setAiLoading(false);
    }
  }, [gameState, currentEvents, selectedModel]);

  const handleEndTurn = useCallback(async () => {
    if (!gameState) return;

    const choiceEntries = currentEvents
      .filter(e => decisions.has(e.id))
      .map(e => ({ event: e, choiceIndex: decisions.get(e.id)! }));

    if (choiceEntries.length < currentEvents.length) return;

    // Save AI-generated events to localStorage for future reuse
    for (const { event } of choiceEntries) {
      if (event.id.startsWith('ai_')) {
        saveAiEvent(event);
      }
    }

    const newState = resolveTurn(gameState, choiceEntries);
    setGameState(newState);

    if (newState.gameOver) {
      setScreen('gameover');
      return;
    }

    // Show election results if an election just happened and player won
    if (newState.electionPending && newState.lastElectionResult) {
      setScreen('election');
      return;
    }

    const { events, nextState: turnState } = await generateEvents(newState);
    setGameState(turnState);
    setCurrentEvents(events);
    setDecisions(new Map());
  }, [gameState, currentEvents, decisions, generateEvents]);

  const handleRestart = useCallback(() => {
    setScreen('title');
    setGameState(null);
    setCurrentEvents([]);
    setDecisions(new Map());
  }, []);

  const handleAdvancePillar = useCallback((pillar: PillarId, direction: 1 | -1) => {
    setGameState(prev => {
      if (!prev) return prev;
      const { next, step } = advancePillar(prev.constitution, pillar, direction);
      if (!step) return prev;
      // Apply step effects to indicators + faction bias
      const newIndicators = { ...prev.indicators };
      for (const eff of step.effects) {
        const meta = INDICATORS.find(i => i.key === eff.indicator);
        const cur = newIndicators[eff.indicator] ?? 0;
        const min = meta?.min ?? 0;
        const max = meta?.max ?? 100;
        newIndicators[eff.indicator] = Math.min(max, Math.max(min, cur + eff.delta));
      }
      const newFaction = step.factionBias
        ? Object.entries(step.factionBias).reduce((acc, [fid, delta]) => {
            const cur = acc[fid as keyof typeof acc] ?? 50;
            acc[fid as keyof typeof acc] = Math.max(0, Math.min(100, cur + delta));
            return acc;
          }, { ...prev.factionApproval })
        : prev.factionApproval;
      return { ...prev, constitution: next, indicators: newIndicators, factionApproval: newFaction };
    });
  }, []);

  const handleResolveDemand = useCallback((demandId: string, optionIdx: number) => {
    setGameState(prev => {
      if (!prev) return prev;
      const { state: nextSp, option } = resolveDemand(prev.superpowers, demandId, optionIdx, prev.turn);
      if (!option) return prev;
      // Apply option effects to indicators
      const newIndicators = { ...prev.indicators };
      for (const eff of option.effects) {
        const meta = INDICATORS.find(i => i.key === eff.indicator);
        const cur = newIndicators[eff.indicator] ?? 0;
        const min = meta?.min ?? 0;
        const max = meta?.max ?? 100;
        newIndicators[eff.indicator] = Math.min(max, Math.max(min, cur + eff.delta));
      }
      // Apply faction reactions
      const newFaction = { ...prev.factionApproval };
      if (option.factionReactions) {
        const reactionVal: Record<string, number> = { love: 8, cheer: 4, meh: 0, frown: -4, rage: -8 };
        for (const [fid, level] of Object.entries(option.factionReactions)) {
          const k = fid as keyof typeof newFaction;
          newFaction[k] = Math.max(0, Math.min(100, (newFaction[k] ?? 50) + reactionVal[level]));
        }
      }
      return { ...prev, superpowers: nextSp, indicators: newIndicators, factionApproval: newFaction };
    });
  }, []);

  const handleEnactDecree = useCallback((decreeId: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      const { state: next, def } = enactDecree(prev, decreeId);
      if (!def) return prev;
      // Apply enact-time faction reactions
      let factionApproval = prev.factionApproval;
      if (def.factionReactions) {
        factionApproval = { ...prev.factionApproval };
        const reactionVal: Record<string, number> = { love: 8, cheer: 4, meh: 0, frown: -4, rage: -8 };
        for (const [fid, level] of Object.entries(def.factionReactions)) {
          const k = fid as keyof typeof factionApproval;
          factionApproval[k] = Math.max(0, Math.min(100, (factionApproval[k] ?? 50) + reactionVal[level]));
        }
      }
      return { ...next, factionApproval };
    });
  }, []);

  const handleRevokeDecree = useCallback((decreeId: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      const { state: next } = revokeDecree(prev, decreeId);
      return next;
    });
  }, []);

  const handleElectionContinue = useCallback(async () => {
    if (!gameState) return;
    // Clear election pending flag and route to manifesto for new term
    const updatedState = { ...gameState, electionPending: false, lastElectionResult: undefined };
    setPendingState(updatedState);
    setScreen('manifesto');
  }, [gameState]);

  const handleNewTermManifestoConfirm = useCallback(async (promiseIds: string[]) => {
    if (!pendingState) return;
    const termIndex = pendingState.parliament.electionHistory.length;
    const finalState = {
      ...pendingState,
      promises: [
        ...pendingState.promises,
        ...promiseIds.map(id => ({ promiseId: id, termIndex })),
      ],
    };
    setGameState(finalState);
    setPendingState(null);
    const { events, nextState: turnState } = await generateEvents(finalState);
    setGameState(turnState);
    setCurrentEvents(events);
    setDecisions(new Map());
    setScreen('game');
  }, [pendingState, generateEvents]);

  const handleQuiz = useCallback(() => {
    setScreen('quiz');
  }, []);

  return (
    <div className="min-h-screen">
      {screen === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          onQuiz={handleQuiz}
          onReality={() => setScreen('reality')}
          scenarios={HISTORICAL_SCENARIOS}
        />
      )}
      {screen === 'quiz' && <QuizScreen onBack={handleRestart} />}
      {screen === 'onboarding' && (
        <OnboardingScreen
          onConfirm={handleTraitsConfirm}
          onBack={() => setScreen('title')}
        />
      )}
      {screen === 'manifesto' && (
        <ManifestoScreen
          onConfirm={gameState ? handleNewTermManifestoConfirm : handleManifestoConfirm}
          termNumber={(pendingState?.parliament.electionHistory.length ?? 0) + (gameState ? 0 : 1)}
        />
      )}
      {screen === 'budget' && (
        <BudgetScreen onAllocate={handleBudgetAllocate} onSkip={handleBudgetSkip} />
      )}
      {screen === 'reality' && <RealityDashboard onBack={handleRestart} />}
      {screen === 'game' && gameState && (
        <GameScreen
          state={gameState}
          events={currentEvents}
          decisions={decisions}
          onMakeChoice={handleMakeChoice}
          onEndTurn={handleEndTurn}
          onAdvancePillar={handleAdvancePillar}
          onResolveDemand={handleResolveDemand}
          onEnactDecree={handleEnactDecree}
          onRevokeDecree={handleRevokeDecree}
          aiMode={aiMode}
          onToggleAI={() => setAiMode(m => !m)}
          aiModels={aiModels}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onCustomResponse={handleCustomResponse}
          aiLoading={aiLoading}
        />
      )}
      {screen === 'gameover' && gameState && (
        <GameOverScreen state={gameState} onRestart={handleRestart} />
      )}
      {screen === 'election' && gameState && gameState.lastElectionResult && (
        <ElectionResultsScreen
          state={gameState}
          result={gameState.lastElectionResult}
          onContinue={handleElectionContinue}
        />
      )}
    </div>
  );
}
