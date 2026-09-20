import React, { useState, useEffect } from 'react';
import { Heist, HeistResult, PlayerAction, MovementLogEntry } from '../shared/types.js';
import { Navbar } from './components/Navbar.js';
import { HeistSetup } from './components/HeistSetup.js';
import { LiveHeistView } from './components/LiveHeistView.js';
import { ResultsScreen } from './components/ResultsScreen.js';
import { AlgorithmExplainer } from './components/AlgorithmExplainer.js';
import { apiGenerateHeist, apiSolveHeist, apiSubmitPlayerRun } from './services/api.js';
import { soundFx } from './utils/audio.js';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<'setup' | 'live' | 'results'>('setup');
  const [heist, setHeist] = useState<Heist | null>(null);
  const [heistResult, setHeistResult] = useState<HeistResult | null>(null);
  const [playerActions, setPlayerActions] = useState<PlayerAction[]>([]);
  const [playerMovementLog, setPlayerMovementLog] = useState<MovementLogEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundFx.enabled);
  const [showExplainer, setShowExplainer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with soundFx and preload on initial load
  useEffect(() => {
    soundFx.preload();
  }, []);

  const handleToggleSound = (enabled: boolean) => {
    soundFx.setEnabled(enabled);
    setSoundEnabled(enabled);
  };

  // Initialize first heist
  const loadNewHeist = async (options: {
    roomCount?: number;
    timeBudget?: number;
    difficulty?: 'Rookie' | 'Standard' | 'Mastermind' | 'Impossible';
  } = {}) => {
    setIsLoading(true);
    try {
      const newHeist = await apiGenerateHeist(options);
      setHeist(newHeist);
      const solved = await apiSolveHeist(newHeist);
      setHeistResult(solved);
    } catch (err) {
      console.error('Failed to initialize heist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNewHeist({ difficulty: 'Standard' });
  }, []);

  const handleStartHeist = () => {
    if (!heist || !heistResult) return;
    setPlayerActions([]);
    setPlayerMovementLog([]);
    setCurrentScreen('live');
  };

  const handleFinishHeist = async (actions: PlayerAction[], movementLog: MovementLogEntry[]) => {
    setPlayerActions(actions);
    setPlayerMovementLog(movementLog);
    if (heist) {
      try {
        await apiSubmitPlayerRun(heist.id, actions, heist);
      } catch (err) {
        console.error('Failed to submit player run:', err);
      }
    }
    setCurrentScreen('results');
  };

  const handleResetToSetup = () => {
    setCurrentScreen('setup');
    loadNewHeist({ difficulty: heist?.difficulty || 'Standard' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top HUD Navigation Bar */}
      <Navbar
        soundEnabled={soundEnabled}
        setSoundEnabled={handleToggleSound}
        onOpenExplainer={() => setShowExplainer(true)}
        currentScreen={currentScreen}
        onResetToSetup={handleResetToSetup}
      />

      {/* Main Game Screen Router */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {isLoading && !heist ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
            <div className="font-display animate-pulse-glow" style={{ fontSize: '1.5rem', color: '#00f0ff' }}>
              INITIALIZING VAULT PROTOCOLS...
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Generating secure room matrices and running 0/1 knapsack solvers
            </div>
          </div>
        ) : currentScreen === 'setup' && heist ? (
          <HeistSetup
            heist={heist}
            onGenerateNew={loadNewHeist}
            onStartHeist={handleStartHeist}
            isLoading={isLoading}
          />
        ) : currentScreen === 'live' && heist && heistResult ? (
          <LiveHeistView
            heist={heist}
            heistResult={heistResult}
            onFinishHeist={handleFinishHeist}
          />
        ) : currentScreen === 'results' && heist && heistResult ? (
          <ResultsScreen
            heist={heist}
            heistResult={heistResult}
            playerActions={playerActions}
            playerMovementLog={playerMovementLog}
            onPlayAgain={handleResetToSetup}
          />
        ) : null}
      </main>

      {/* Educational Algorithm Theory & Complexity Modal */}
      <AlgorithmExplainer
        isOpen={showExplainer}
        onClose={() => setShowExplainer(false)}
      />
    </div>
  );
}
