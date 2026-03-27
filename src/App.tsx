import { useState, useCallback, useEffect } from 'react';
import { GameState, GameEvent } from './engine/types';
import { createInitialState } from './engine/state';
import { startTurn, resolveTurn } from './engine/turn';
import { ALL_EVENTS } from './data';
import { generateAIEvent, evaluateCustomChoice, getAvailableModels, type AIModel } from './engine/ai';
import { fetchDynamicStartData, fetchHistoricalData, type HistoricalScenario, HISTORICAL_SCENARIOS } from './engine/latviaData';
import TitleScreen from './ui/TitleScreen';
import GameScreen from './ui/GameScreen';
import GameOverScreen from './ui/GameOverScreen';
import QuizScreen from './ui/QuizScreen';
import BudgetScreen from './ui/BudgetScreen';
import RealityDashboard from './ui/RealityDashboard';

type Screen = 'title' | 'game' | 'gameover' | 'quiz' | 'budget' | 'reality';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([]);
  const [decisions, setDecisions] = useState<Map<string, number>>(new Map());
  const [aiMode, setAiMode] = useState(false);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);
  const [pendingState, setPendingState] = useState<GameState | null>(null);

  // Check available AI models on mount
  useEffect(() => {
    getAvailableModels().then(({ models }) => {
      setAiModels(models);
      if (models.length > 0) setSelectedModel(models[0].id);
    });
  }, []);

  const generateEvents = useCallback(async (state: GameState): Promise<GameEvent[]> => {
    const { events: staticEvents } = startTurn(state, ALL_EVENTS);

    if (!aiMode || aiModels.length === 0) {
      return staticEvents;
    }

    // Hybrid: 1 static + 1 AI-generated event
    setAiLoading(true);
    try {
      const aiEvent = await generateAIEvent(state, selectedModel);
      if (aiEvent) {
        return [staticEvents[0], aiEvent as GameEvent].filter(Boolean);
      }
    } catch {
      // Fallback to all static
    } finally {
      setAiLoading(false);
    }
    return staticEvents;
  }, [aiMode, aiModels, selectedModel]);

  const handleStartGame = useCallback(async (scenario?: HistoricalScenario) => {
    const state = createInitialState();

    // Fetch real data to override starting conditions
    try {
      const overrides = scenario
        ? await fetchHistoricalData(scenario.year)
        : await fetchDynamicStartData();
      for (const [key, value] of Object.entries(overrides)) {
        if (value !== null && value !== undefined) state.indicators[key] = value;
      }
      if (scenario) {
        state.year = scenario.year;
      }
    } catch {
      // Fall back to hardcoded values
    }

    setPendingState(state);
    setScreen('budget');
  }, []);

  const handleBudgetAllocate = useCallback(async (allocations: Record<string, number>) => {
    const state = pendingState;
    if (!state) return;

    // Map budget allocations to game indicator effects
    const budgetMap: Record<string, { indicator: string; scale: number }> = {
      GF02: { indicator: 'militaryReadiness', scale: 0.005 },
      GF03: { indicator: 'borderSecurity', scale: 0.004 },
      GF07: { indicator: 'healthcareQuality', scale: 0.003 },
      GF09: { indicator: 'educationQuality', scale: 0.003 },
      GF10: { indicator: 'socialCohesion', scale: 0.001 },
      GF05: { indicator: 'greenTransition', scale: 0.01 },
    };

    for (const [code, alloc] of Object.entries(allocations)) {
      const mapping = budgetMap[code];
      if (mapping) {
        // Normalize allocation relative to a baseline (effect = (alloc - baseline) * scale)
        const baselineEffect = alloc * mapping.scale;
        state.indicators[mapping.indicator] = Math.max(0, Math.min(100,
          (state.indicators[mapping.indicator] || 50) + (baselineEffect - 3)
        ));
      }
    }

    setGameState(state);
    const events = await generateEvents(state);
    setCurrentEvents(events);
    setDecisions(new Map());
    setScreen('game');
  }, [pendingState, generateEvents]);

  const handleBudgetSkip = useCallback(async () => {
    const state = pendingState;
    if (!state) return;
    setGameState(state);
    const events = await generateEvents(state);
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

    const newState = resolveTurn(gameState, choiceEntries);
    setGameState(newState);

    if (newState.gameOver) {
      setScreen('gameover');
      return;
    }

    const events = await generateEvents(newState);
    setCurrentEvents(events);
    setDecisions(new Map());
  }, [gameState, currentEvents, decisions, generateEvents]);

  const handleRestart = useCallback(() => {
    setScreen('title');
    setGameState(null);
    setCurrentEvents([]);
    setDecisions(new Map());
  }, []);

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
      {screen === 'budget' && (
        <BudgetScreen onAllocate={handleBudgetAllocate} onSkip={handleBudgetSkip} />
      )}
      {screen === 'reality' && <RealityDashboard />}
      {screen === 'game' && gameState && (
        <GameScreen
          state={gameState}
          events={currentEvents}
          decisions={decisions}
          onMakeChoice={handleMakeChoice}
          onEndTurn={handleEndTurn}
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
    </div>
  );
}
