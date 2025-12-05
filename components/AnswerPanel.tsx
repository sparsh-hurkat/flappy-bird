import React, { useRef, useEffect, useState } from 'react';
import { Answer } from '../types';
import { JOB_APPLICATION_ANSWERS } from '../content';

interface AnswerPanelProps {
  unlockedCount: number;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({ unlockedCount, setUnlockedCount }) => {
  const lastUnlockedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (unlockedCount > 0 && lastUnlockedRef.current) {
      lastUnlockedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [unlockedCount]);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-8 flex flex-col gap-8">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={`${window.location.pathname.startsWith('/flappy-bird') ? '/flappy-bird' : ''}/assets/logo.png`}
            width={24}
            height={24}
            alt="OpenSesame Logo"
          />
          <h1 className="text-3xl font-extrabold text-slate-800">OpenSesame Application</h1>
        </div>
        <p className="text-slate-500">
          Play the game & collect the OpenSesame logo to unlock my responses. .
        </p>
        <p className="text-slate-500">
          If you are a cheater and want to see the answers without playing the game, you can click <button onClick={() => setUnlockedCount(3)} className="text-blue-600 underline">here</button> to unlock them all.
        </p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(Math.min(unlockedCount, 3) / 3) * 100}%` }}
          ></div>
        </div>
        <p className="text-right text-xs text-slate-400 mt-1">{Math.min(unlockedCount, 3)} / 3 Unlocked</p>
      </div>

      {JOB_APPLICATION_ANSWERS.map((item, index) => {
        const isUnlocked = index < unlockedCount;

        return (
          <div
            key={item.id}
            ref={index === unlockedCount - 1 ? lastUnlockedRef : null}
            className={`
              relative p-6 rounded-2xl border-2 transition-all duration-700 transform
              ${isUnlocked
                ? 'bg-white border-blue-500 shadow-xl opacity-100 translate-y-0'
                : 'bg-slate-100 border-slate-200 shadow-none opacity-50 translate-y-4 blur-[2px]'
              }
            `}
          >
            {/* Lock Icon for locked state */}
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-slate-200 rounded-full p-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            )}

            <div className={!isUnlocked ? 'select-none pointer-events-none' : ''}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                  ${isUnlocked ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-500'}
                `}>
                  {item.id}
                </span>
                <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
              </div>

              <div className="prose prose-slate text-slate-600 leading-relaxed whitespace-pre-line">
                {isUnlocked ? item.response : "Collect more tokens to reveal this answer..."}
              </div>
            </div>
          </div>
        );
      })}

      {unlockedCount >= 3 && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl mt-4 animate-fade-in text-center">
          <h3 className="text-xl font-bold text-green-800 mb-2">All Answers Unlocked!</h3>
          <p className="text-green-700">

            Thank you for taking the time to review my application!<br />
            I really admire the work your team is doing, and I’d love the opportunity to contribute to it.<br />
            If you have any questions, please feel free to reach out to me or ask {' '}
            <a href="https://sparshhurkat.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">SPOT</a><br />
          </p>
        </div>
      )}
    </div>
  );
};