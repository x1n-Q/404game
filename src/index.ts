/**
 * 404game.js — Turn boring 404 pages into playable mini-games.
 *
 * Quick start:
 *   <script src="404game.js"></script>
 *   <div id="game"></div>
 *   <script>Game404.mount('#game', { game: 'snake' });</script>
 */

import type {
  Game404Options,
  Game404Instance,
  GameModule,
  GameName,
} from './types';
import { Engine } from './core/Engine';
import { Overlay } from './ui/Overlay';
import { Storage } from './core/Storage';
import { getTheme } from './ui/themes';
import { createSnake } from './games/Snake';
import { createFlappy } from './games/Flappy';
import { createBreakout } from './games/Breakout';
import { createDino } from './games/Dino';

const VERSION = '0.1.0';

const REGISTRY: Record<Exclude<GameName, 'random'>, () => GameModule> = {
  snake: createSnake,
  flappy: createFlappy,
  breakout: createBreakout,
  dino: createDino,
};

const instances = new WeakMap<Element, Game404Instance>();

function resolveTarget(selector: string | Element): HTMLElement {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) throw new Error(`404game: target not found: ${String(selector)}`);
  return el as HTMLElement;
}

function pickGame(name: GameName | undefined): { name: string; module: GameModule } {
  if (!name || name === 'random') {
    const keys = Object.keys(REGISTRY) as Array<Exclude<GameName, 'random'>>;
    const k = keys[Math.floor(Math.random() * keys.length)]!;
    return { name: k, module: REGISTRY[k]() };
  }
  const factory = REGISTRY[name as Exclude<GameName, 'random'>];
  if (!factory) throw new Error(`404game: unknown game "${name}"`);
  return { name, module: factory() };
}

export function mount(
  selector: string | Element,
  options: Game404Options = {},
): Game404Instance {
  const target = resolveTarget(selector);
  // If already mounted, destroy previous instance first.
  const existing = instances.get(target);
  if (existing) existing.destroy();

  const theme = getTheme(options.theme);
  const width = options.width ?? (Math.min(target.clientWidth || 480, 720) || 480);
  const height = options.height ?? 360;

  // Wrap container so we own the DOM inside.
  target.classList.add('g404-root');
  target.innerHTML = '';

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'g404-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvas.className = 'g404-canvas';
  canvas.style.background = theme.bg;
  canvasWrap.appendChild(canvas);

  // Order: banner, hud, canvas (overlays appended into canvasWrap)
  // Overlay constructor appends banner+hud+screens to `target` directly.
  // We want layout: [banner][hud][canvasWrap (with absolute overlays)]
  target.appendChild(canvasWrap);

  let currentGameName = '';
  let currentScore = 0;

  // Build initial game module
  let picked = pickGame(options.game);
  currentGameName = picked.name;

  const overlay = new Overlay(target, {
    message: options.message ?? '404 — Page Not Found',
    subMessage: options.subMessage ?? 'But hey, want to play instead?',
    theme,
    showHighscore: options.showHighscore !== false,
    onStart: () => {
      overlay.hideStart();
      overlay.hideGameOver();
      engine.start();
      options.onStart?.();
    },
    onRestart: () => {
      overlay.hideGameOver();
      // re-create game module so internal state resets cleanly
      picked = pickGame(options.game);
      currentGameName = picked.name;
      engine.destroy();
      buildEngine();
      engine.start();
      options.onStart?.();
    },
  });

  // Move overlays into canvas wrap so they sit on top of the canvas.
  const startScreen = target.querySelector('.g404-start') as HTMLElement | null;
  const gameOverScreen = target.querySelector('.g404-gameover') as HTMLElement | null;
  if (startScreen) canvasWrap.appendChild(startScreen);
  if (gameOverScreen) canvasWrap.appendChild(gameOverScreen);
  canvasWrap.style.position = 'relative';

  overlay.setHighscore(Storage.getHighscore(currentGameName));

  let engine!: Engine;

  function buildEngine(): void {
    engine = new Engine({
      canvas,
      theme,
      width,
      height,
      game: picked.module,
      onScore: (s: number) => {
        currentScore = s;
        overlay.setScore(s);
        options.onScore?.(s);
      },
      onGameOver: (s: number) => {
        Storage.setHighscore(currentGameName, s);
        overlay.setHighscore(Storage.getHighscore(currentGameName));
        overlay.showGameOver(s);
        options.onGameOver?.(s);
      },
      onWin: (s: number) => {
        Storage.setHighscore(currentGameName, s);
        overlay.setHighscore(Storage.getHighscore(currentGameName));
        overlay.showGameOver(s);
        options.onWin?.(s);
      },
    });
  }

  buildEngine();

  // Start flow
  if (options.autoStart) {
    overlay.hideStart();
    engine.start();
  } else {
    overlay.showStart();
    // Allow tap/space anywhere on canvas to start.
    const startOnAction = (e: Event) => {
      e.preventDefault();
      if (!engine.isRunning() && target.querySelector('.g404-start')?.checkVisibility?.() !== false) {
        const startVisible = (startScreen?.style.display !== 'none');
        if (startVisible) {
          overlay.hideStart();
          engine.start();
          options.onStart?.();
        }
      }
    };
    canvas.addEventListener('click', startOnAction);
    window.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !engine.isRunning()) {
        const startVisible = (startScreen?.style.display !== 'none');
        if (startVisible) {
          e.preventDefault();
          overlay.hideStart();
          engine.start();
          options.onStart?.();
        }
      }
    });
  }

  const instance: Game404Instance = {
    destroy() {
      engine.destroy();
      overlay.destroy();
      target.innerHTML = '';
      target.classList.remove('g404-root');
      instances.delete(target);
    },
    restart() {
      engine.destroy();
      picked = pickGame(options.game);
      currentGameName = picked.name;
      buildEngine();
      overlay.setHighscore(Storage.getHighscore(currentGameName));
      overlay.hideGameOver();
      overlay.hideStart();
      engine.start();
    },
    getScore() {
      return currentScore;
    },
  };

  instances.set(target, instance);
  return instance;
}

export function unmount(selector: string | Element): void {
  const target = resolveTarget(selector);
  const instance = instances.get(target);
  if (instance) instance.destroy();
}

export const games: ReadonlyArray<Exclude<GameName, 'random'>> = ['snake', 'flappy', 'breakout', 'dino'];

export const version = VERSION;

// Re-export public types
export type {
  Game404Options,
  Game404Instance,
  GameName,
  ThemeName,
  Theme,
} from './types';

// Default export so UMD build exposes `window.Game404` with all members.
const Game404 = { mount, unmount, games, version };
export default Game404;
