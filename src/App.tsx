import { useState, useCallback } from 'react';
import { GameState, GameEvent } from './engine/types';
import { createInitialState } from './engine/state';
import { startTurn, resolveTurn } from './engine/turn';
import { ALL_EVENTS } from './data';
import TitleScreen from './ui/TitleScreen';
import GameScreen from './ui/GameScreen';
import GameOverScreen from './ui/GameOverScreen';

type Screen = 'title' | 'game' | 'gameover';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([]);
  const [decisions, setDecisions] = useState<Map<string, number>>(new Map());

  const handleStartGame = useCallback(() => {
    const state = createInitialState();
    setGameState(state);
    const { events } = startTurn(state, ALL_EVENTS);
    setCurrentEvents(events);
    setDecisions(new Map());
    setScreen('game');
  }, []);

  const handleMakeChoice = useCallback((eventId: string, choiceIndex: number) => {
    setDecisions(prev => {
      const next = new Map(prev);
      next.set(eventId, choiceIndex);
      return next;
    });
  }, []);

  const handleEndTurn = useCallback(() => {
    if (!gameState) return;

    const choiceEntries = currentEvents
      .filter(e => decisions.has(e.id))
      .map(e => ({ event: e, choiceIndex: decisions.get(e.id)! }));

    if (choiceEntries.length < currentEvents.length) return; // Not all decisions made

    const newState = resolveTurn(gameState, choiceEntries);
    setGameState(newState);

    if (newState.gameOver) {
      setScreen('gameover');
      return;
    }

    const { events } = startTurn(newState, ALL_EVENTS);
    setCurrentEvents(events);
    setDecisions(new Map());
  }, [gameState, currentEvents, decisions]);

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
        />
      )}
      {screen === 'gameover' && gameState && (
        <GameOverScreen state={gameState} onRestart={handleRestart} />
      )}
    </div>
  );
}
