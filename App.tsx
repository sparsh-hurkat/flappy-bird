import React, { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { AnswerPanel } from './components/AnswerPanel';

export default function App() {
  const [unlockedCount, setUnlockedCount] = useState(0);

  const handleUnlock = useCallback(() => {
    setUnlockedCount(prev => Math.min(prev + 1, 3));
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-slate-900">
      <div className="w-full h-[50vh] md:w-1/2 md:h-full relative order-1 md:order-1">
        <GameCanvas onUnlock={handleUnlock} />
      </div>

      <div className="w-full h-[50vh] md:w-1/2 md:h-full relative order-2 md:order-2 bg-white z-10">
        <AnswerPanel unlockedCount={unlockedCount} setUnlockedCount={setUnlockedCount} />
      </div>
    </div>
  );
}