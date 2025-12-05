import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../game/MainScene';
import { GameEvents } from '../types';

interface GameCanvasProps {
  onUnlock: () => void;
  unlockedCount: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onUnlock, unlockedCount }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [pausedForUnlock, setPausedForUnlock] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      parent: containerRef.current,
      width: '100%',
      height: '100%',
      backgroundColor: '#93c5fd',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [MainScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Listen to events from the scene
    game.events.on(GameEvents.GAME_OVER, () => {
      setGameOver(true);
    });

    game.events.on(GameEvents.UNLOCK_ANSWER, () => {
      setPausedForUnlock(true);
      onUnlock();
    });

    game.events.on(GameEvents.SCORE_UPDATE, (newScore: number) => {
      setScore(newScore);
    });

    return () => {
      game.destroy(true);
    };
  }, [onUnlock]);

  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (scene) {
        scene.setUnlockedCount(unlockedCount);
      }
    }
  }, [unlockedCount]);

  const handleRestart = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene.restartGame();
      setGameOver(false);
      setScore(0);
    }
  };

  const handleResume = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene.resumeGame();
      setPausedForUnlock(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden border-r-4 border-slate-300">
      <div ref={containerRef} className="w-full h-full" />

      {/* Score HUD */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg font-bold text-slate-800 pointer-events-none">
        Score: {score}
      </div>

      {/* Pause/Unlock Overlay */}
      {pausedForUnlock && (
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4 animate-bounce-slight">
            <h2 className="text-3xl font-extrabold text-blue-600 mb-2">Insight Unlocked!</h2>
            <p className="text-gray-600 mb-6">You've collected an OpenSesame token. A new answer has been revealed.</p>
            <button
              onClick={handleResume}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition transform hover:scale-105 shadow-lg"
            >
              Continue Journey
            </button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
            <h2 className="text-4xl font-black text-red-500 mb-2">Game Over</h2>
            <p className="text-gray-500 mb-6 font-medium">Your progress is saved.</p>
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-full transition transform hover:scale-105 shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Start Instructions Overlay */}
      {!gameOver && !pausedForUnlock && score === 0 && (
        <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none opacity-75">
          <p className="text-white text-lg font-bold shadow-black drop-shadow-md">Tap or Spacebar to Jump</p>
        </div>
      )}
    </div>
  );
};