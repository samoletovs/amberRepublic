import { useState, useCallback, useEffect } from 'react';
import { GameState, GameEvent } from './engine/types';
import { createInitialState } from './engine/state';
import { startTurn, resolveTurn } from './engine/turn';
import { ALL_EVENTS } from './data';
import { generateAIEvent, evaluateCustomChoice, getAvailableModels, type AIModel } from './engine/ai';
import TitleScreen from './ui/TitleScreen';
import GameScreen from './ui/GameScreen';
import GameOverScreen from './ui/GameOverScreen';

type Screen = 'title' | 'game' | 'gameover';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([]);
  const [decisions, setDecisions] = useState<Map<string, number>>(new Map());
  const [aiMode, setAiMode] = useState(false);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);

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

  const handleStartGame = useCallback(async () => {
    const state = createInitialState();
    setGameState(state);
    const events = await generateEvents(state);
    setCurrentEvents(events);
    setDecisions(new Map());
    setScreen('game');
  }, [generateEvents]);

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

  return (
    <div className="min-h-screen">
      {screen === 'title' && <TitleScreen onStart={handleStartGame} />}
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
