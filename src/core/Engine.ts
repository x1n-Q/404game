import type { GameContext, GameModule, Theme, InputState } from '../types';
import { Input } from './Input';
import { Renderer } from './Renderer';

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  theme: Theme;
  width: number;
  height: number;
  game: GameModule;
  onScore: (score: number) => void;
  onGameOver: (score: number) => void;
  onWin: (score: number) => void;
}

type State = 'idle' | 'running' | 'gameover' | 'won';

export class Engine {
  private opts: EngineOptions;
  private ctx2d: CanvasRenderingContext2D;
  private input: Input;
  private rafId: number | null = null;
  private state: State = 'idle';
  private lastTime = 0;
  private startTime = 0;
  private score = 0;
  private gameCtx: GameContext;

  constructor(opts: EngineOptions) {
    this.opts = opts;
    const ctx = opts.canvas.getContext('2d');
    if (!ctx) throw new Error('404game: 2D canvas context unavailable');
    this.ctx2d = ctx;

    // Handle high-DPI: scale backing store but draw in CSS pixels.
    const dpr = window.devicePixelRatio || 1;
    opts.canvas.width = opts.width * dpr;
    opts.canvas.height = opts.height * dpr;
    opts.canvas.style.width = `${opts.width}px`;
    opts.canvas.style.height = `${opts.height}px`;
    this.ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.input = new Input(opts.canvas);

    this.gameCtx = {
      ctx: this.ctx2d,
      width: opts.width,
      height: opts.height,
      theme: opts.theme,
      input: this.input.state,
      dt: 0,
      time: 0,
      setScore: (s: number) => {
        this.score = s;
        this.opts.onScore(s);
      },
      gameOver: () => this.handleGameOver(),
      win: () => this.handleWin(),
    };
  }

  start(): void {
    if (this.state === 'running') return;
    this.score = 0;
    this.opts.onScore(0);
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.state = 'running';
    this.opts.game.init(this.gameCtx);
    this.loop();
  }

  stop(): void {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.state = 'idle';
  }

  isRunning(): boolean {
    return this.state === 'running';
  }

  private loop = (): void => {
    if (this.state !== 'running') return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1000); // cap at 50ms
    this.lastTime = now;

    this.gameCtx.dt = dt;
    this.gameCtx.time = (now - this.startTime) / 1000;

    this.input.beginFrame();
    Renderer.clear(this.ctx2d, this.opts.width, this.opts.height, this.opts.theme);
    this.opts.game.update(this.gameCtx);
    if (this.state === 'running') {
      this.opts.game.draw(this.gameCtx);
    }
    this.input.endFrame();

    this.rafId = requestAnimationFrame(this.loop);
  };

  private handleGameOver(): void {
    if (this.state !== 'running') return;
    this.state = 'gameover';
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.opts.onGameOver(this.score);
  }

  private handleWin(): void {
    if (this.state !== 'running') return;
    this.state = 'won';
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.opts.onWin(this.score);
  }

  getInputState(): InputState {
    return this.input.state;
  }

  destroy(): void {
    this.stop();
    this.input.destroy();
    this.opts.game.destroy?.();
  }
}
