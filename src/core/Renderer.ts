import type { Theme } from '../types';

/** Helpers for drawing on a 2D canvas with theme support. */
export const Renderer = {
  clear(ctx: CanvasRenderingContext2D, w: number, h: number, theme: Theme): void {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);
  },

  rect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
  ): void {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  },

  circle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: string,
  ): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  },

  text(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options: {
      color?: string;
      size?: number;
      font?: string;
      align?: CanvasTextAlign;
      baseline?: CanvasTextBaseline;
      bold?: boolean;
    } = {},
  ): void {
    const size = options.size ?? 16;
    const weight = options.bold ? 'bold ' : '';
    ctx.fillStyle = options.color ?? '#fff';
    ctx.font = `${weight}${size}px ${options.font ?? 'monospace'}`;
    ctx.textAlign = options.align ?? 'left';
    ctx.textBaseline = options.baseline ?? 'alphabetic';
    ctx.fillText(text, x, y);
  },

  glow(
    ctx: CanvasRenderingContext2D,
    color: string,
    blur: number,
    draw: () => void,
  ): void {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    draw();
    ctx.restore();
  },
};
