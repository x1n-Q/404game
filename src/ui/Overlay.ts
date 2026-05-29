import type { Theme } from '../types';

export interface OverlayOptions {
  message: string;
  subMessage: string;
  theme: Theme;
  showHighscore: boolean;
  onStart: () => void;
  onRestart: () => void;
}

export class Overlay {
  private root: HTMLElement;
  private banner: HTMLElement;
  private startScreen: HTMLElement;
  private gameOverScreen: HTMLElement;
  private hud: HTMLElement;
  private scoreEl: HTMLElement;
  private highEl: HTMLElement;
  private finalScoreEl: HTMLElement;
  private opts: OverlayOptions;

  constructor(container: HTMLElement, opts: OverlayOptions) {
    this.opts = opts;
    this.root = container;

    // Banner
    this.banner = document.createElement('div');
    this.banner.className = 'g404-banner';
    this.banner.innerHTML = `
      <div class="g404-banner-title">${escape(opts.message)}</div>
      <div class="g404-banner-sub">${escape(opts.subMessage)}</div>
    `;

    // HUD (score)
    this.hud = document.createElement('div');
    this.hud.className = 'g404-hud';
    this.scoreEl = document.createElement('span');
    this.scoreEl.className = 'g404-score';
    this.scoreEl.textContent = 'Score: 0';
    this.highEl = document.createElement('span');
    this.highEl.className = 'g404-high';
    this.highEl.textContent = 'Best: 0';
    this.hud.appendChild(this.scoreEl);
    if (opts.showHighscore) this.hud.appendChild(this.highEl);

    // Start screen
    this.startScreen = document.createElement('div');
    this.startScreen.className = 'g404-screen g404-start';
    this.startScreen.innerHTML = `
      <div class="g404-screen-title">READY?</div>
      <div class="g404-screen-sub">Press SPACE or TAP to start</div>
      <button class="g404-btn" type="button">▶ START</button>
    `;
    this.startScreen.querySelector('button')!.addEventListener('click', (e) => {
      e.stopPropagation();
      opts.onStart();
    });

    // Game-over screen
    this.gameOverScreen = document.createElement('div');
    this.gameOverScreen.className = 'g404-screen g404-gameover';
    this.gameOverScreen.style.display = 'none';
    this.gameOverScreen.innerHTML = `
      <div class="g404-screen-title">GAME OVER</div>
      <div class="g404-final-score">Score: <span class="g404-final">0</span></div>
      <button class="g404-btn" type="button">↻ PLAY AGAIN</button>
    `;
    this.finalScoreEl = this.gameOverScreen.querySelector('.g404-final')!;
    this.gameOverScreen.querySelector('button')!.addEventListener('click', (e) => {
      e.stopPropagation();
      opts.onRestart();
    });

    this.injectStyles(opts.theme);
    this.root.appendChild(this.banner);
    this.root.appendChild(this.hud);
    this.root.appendChild(this.startScreen);
    this.root.appendChild(this.gameOverScreen);
  }

  private injectStyles(theme: Theme): void {
    if (document.getElementById('g404-styles')) return;
    const style = document.createElement('style');
    style.id = 'g404-styles';
    style.textContent = `
      .g404-root { position: relative; display: inline-block; font-family: ${theme.font}; }
      .g404-banner { text-align: center; padding: 12px 8px 8px; color: ${theme.fg}; font-family: ${theme.font}; }
      .g404-banner-title { font-size: 22px; font-weight: bold; letter-spacing: 2px; color: ${theme.accent}; text-shadow: 0 0 12px ${theme.accent}55; }
      .g404-banner-sub { font-size: 13px; color: ${theme.muted}; margin-top: 4px; }
      .g404-hud { display: flex; justify-content: space-between; padding: 6px 12px; color: ${theme.fg}; font-family: ${theme.font}; font-size: 14px; }
      .g404-score { color: ${theme.fg}; }
      .g404-high { color: ${theme.muted}; }
      .g404-canvas-wrap { position: relative; line-height: 0; }
      .g404-canvas { display: block; border-radius: 6px; touch-action: none; cursor: pointer; }
      .g404-screen { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: ${theme.bg}cc; backdrop-filter: blur(4px); color: ${theme.fg}; font-family: ${theme.font}; border-radius: 6px; }
      .g404-screen-title { font-size: 32px; font-weight: bold; letter-spacing: 3px; color: ${theme.accent}; text-shadow: 0 0 16px ${theme.accent}88; }
      .g404-screen-sub { font-size: 14px; color: ${theme.muted}; }
      .g404-final-score { font-size: 18px; color: ${theme.fg}; }
      .g404-final { color: ${theme.accent}; font-weight: bold; }
      .g404-btn { background: ${theme.accent}; color: ${theme.bg}; border: none; padding: 12px 28px; font-size: 16px; font-weight: bold; letter-spacing: 1px; border-radius: 6px; cursor: pointer; font-family: ${theme.font}; transition: transform 0.1s, box-shadow 0.2s; }
      .g404-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px ${theme.accent}66; }
      .g404-btn:active { transform: translateY(0); }
    `;
    document.head.appendChild(style);
  }

  setScore(score: number): void {
    this.scoreEl.textContent = `Score: ${score}`;
  }

  setHighscore(hs: number): void {
    this.highEl.textContent = `Best: ${hs}`;
  }

  showStart(): void {
    this.startScreen.style.display = 'flex';
    this.gameOverScreen.style.display = 'none';
  }

  hideStart(): void {
    this.startScreen.style.display = 'none';
  }

  showGameOver(score: number): void {
    this.finalScoreEl.textContent = String(score);
    this.gameOverScreen.style.display = 'flex';
    this.startScreen.style.display = 'none';
  }

  hideGameOver(): void {
    this.gameOverScreen.style.display = 'none';
  }

  destroy(): void {
    this.banner.remove();
    this.hud.remove();
    this.startScreen.remove();
    this.gameOverScreen.remove();
  }
}

function escape(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
