import { useEffect, useState } from 'react';
import WelcomeScreen from '@/WelcomeScreen';
import WorldMap from '@/WorldMap';
import ActivityModal from '@/ActivityModal';
import { useProgress } from '@/useProgress';
import { ZONES, type Zone } from '@/zones';

type Screen = 'welcome' | 'map';

export default function App() {
  const { progress, markSolved, reset, markStarted } = useProgress();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [activeZone, setActiveZone] = useState<Zone | null>(null);

  // If the student has already started before, boot straight to the map.
  useEffect(() => {
    if (progress.started) setScreen('map');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGame = () => {
    markStarted();
    setScreen('map');
  };

  const exitToMenu = () => {
    setActiveZone(null);
    setScreen('welcome');
  };

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onStart={startGame}
        hasProgress={progress.solved.length > 0}
        onReset={reset}
        solvedCount={progress.solved.length}
        totalZones={ZONES.length}
      />
    );
  }

  return (
    <>
      <WorldMap
        solvedIds={progress.solved}
        stars={progress.stars}
        onSelectZone={setActiveZone}
        onExit={exitToMenu}
      />
      {activeZone && (
        <ActivityModal
          zone={activeZone}
          solved={progress.solved.includes(activeZone.id)}
          onSolved={markSolved}
          onClose={() => setActiveZone(null)}
        />
      )}
    </>
  );
}
