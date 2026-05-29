/**
 * 404game.js — Public Type Definitions
 */

export type GameName = 'snake' | 'flappy' | 'breakout' | 'dino' | 'random';
export type ThemeName = 'neon' | 'retro' | 'minimal' | 'dark';

export interface Game404Options {
  /** Which game to load. Defaults to 'random'. */
  game?: GameName;
  /** Visual theme. Defaults to 'neon'. */
  theme?: ThemeName;
  /** Canvas width in CSS pixels. Defaults to container width or 480. */
  width?: number;
  /** Canvas height in CSS pixels. Defaults to container height or 360. */
  height?: number;
  /** Banner message above the game. Defaults to '404 — Page Not Found'. */
  message?: string;
  /** Sub-message text. Defaults to 'But hey, want to play instead?'. */
  subMessage?: string;
  /** Show high score panel. Defaults to true. */
  showHighscore?: boolean;
  /** Auto-start without showing the start overlay. Defaults to false. */
  autoStart?: boolean;
  /** Fired when the player presses start. */
  onStart?: () => void;
  /** Fired when the player loses; receives final score. */
  onGameOver?: (score: number) => void;
  /** Fired when the player wins (where applicable); receives final score. */
  onWin?: (score: number) => void;
  /** Fired on every score change. */
  onScore?: (score: number) => void;
}

export interface Theme {
  bg: string;
  fg: string;
  accent: string;
  danger: string;
  muted: string;
  font: string;
}

export interface GameContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  theme: Theme;
  input: InputState;
  dt: number;
  time: number;
  setScore: (score: number) => void;
  gameOver: () => void;
  win: () => void;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
  /** True only on the frame the action was first pressed. */
  actionPressed: boolean;
  /** Most recent swipe direction this frame (or null). */
  swipe: 'up' | 'down' | 'left' | 'right' | null;
  /** Pointer tap occurred this frame. */
  tap: boolean;
}

export interface GameModule {
  name: string;
  init(ctx: GameContext): void;
  update(ctx: GameContext): void;
  draw(ctx: GameContext): void;
  destroy?(): void;
}

export interface Game404Instance {
  destroy(): void;
  restart(): void;
  getScore(): number;
}
