export interface Answer {
  id: number;
  title: string;
  response: string;
}

export interface GameState {
  isGameOver: boolean;
  isPaused: boolean;
  score: number;
  unlockedCount: number;
}

// Events communicated from Phaser to React
export enum GameEvents {
  UNLOCK_ANSWER = 'UNLOCK_ANSWER',
  GAME_OVER = 'GAME_OVER',
  SCORE_UPDATE = 'SCORE_UPDATE',
}