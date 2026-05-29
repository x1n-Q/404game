import type { GameContext, GameModule } from '../types';
import { Renderer } from '../core/Renderer';

interface Brick { x: number; y: number; w: number; h: number; alive: boolean; color: string; }

const PADDLE_W = 80;
const PADDLE_H = 10;
const PADDLE_Y_OFFSET = 30;
const PADDLE_SPEED = 420;
const BALL_RADIUS = 6;
const BALL_SPEED = 280;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;

export function createBreakout(): GameModule {
  let paddleX = 0;
  let ballX = 0, ballY = 0;
  let vx = 0, vy = 0;
  let bricks: Brick[] = [];
  let score = 0;
  let launched = false;

  return {
    name: 'breakout',
    init(ctx: GameContext) {
      paddleX = ctx.width / 2 - PADDLE_W / 2;
      ballX = ctx.width / 2;
      ballY = ctx.height - PADDLE_Y_OFFSET - PADDLE_H - BALL_RADIUS - 1;
      vx = 0;
      vy = 0;
      launched = false;
      score = 0;
      ctx.setScore(0);

      bricks = [];
      const pad = 6;
      const offsetY = 40;
      const brickW = (ctx.width - pad * (BRICK_COLS + 1)) / BRICK_COLS;
      const brickH = 16;
      const palette = [ctx.theme.danger, ctx.theme.accent, ctx.theme.fg, ctx.theme.accent, ctx.theme.danger];
      for (let r = 0; r < BRICK_ROWS; r++) {
        for (let col = 0; col < BRICK_COLS; col++) {
          bricks.push({
            x: pad + col * (brickW + pad),
            y: offsetY + r * (brickH + pad),
            w: brickW,
            h: brickH,
            alive: true,
            color: palette[r] ?? ctx.theme.accent,
          });
        }
      }
    },

    update(ctx: GameContext) {
      const { input, dt, width, height } = ctx;

      // Paddle controls: keyboard, swipe (treated as direction hold via input.left/right),
      // or follow tap position on touch (use last touch X via tap fallback - simple: arrows only).
      if (input.left) paddleX -= PADDLE_SPEED * dt;
      if (input.right) paddleX += PADDLE_SPEED * dt;
      if (input.swipe === 'left') paddleX -= 40;
      if (input.swipe === 'right') paddleX += 40;
      paddleX = Math.max(0, Math.min(width - PADDLE_W, paddleX));

      const paddleY = height - PADDLE_Y_OFFSET - PADDLE_H;

      if (!launched) {
        ballX = paddleX + PADDLE_W / 2;
        ballY = paddleY - BALL_RADIUS - 1;
        if (input.actionPressed || input.tap) {
          launched = true;
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
          vx = Math.cos(angle) * BALL_SPEED;
          vy = Math.sin(angle) * BALL_SPEED;
        }
        return;
      }

      ballX += vx * dt;
      ballY += vy * dt;

      // walls
      if (ballX < BALL_RADIUS) { ballX = BALL_RADIUS; vx = -vx; }
      if (ballX > width - BALL_RADIUS) { ballX = width - BALL_RADIUS; vx = -vx; }
      if (ballY < BALL_RADIUS) { ballY = BALL_RADIUS; vy = -vy; }

      // paddle collision
      if (
        ballY + BALL_RADIUS >= paddleY &&
        ballY - BALL_RADIUS <= paddleY + PADDLE_H &&
        ballX >= paddleX && ballX <= paddleX + PADDLE_W && vy > 0
      ) {
        vy = -Math.abs(vy);
        const offset = (ballX - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
        vx = offset * BALL_SPEED * 0.9;
        // normalize
        const speed = Math.sqrt(vx * vx + vy * vy);
        const target = BALL_SPEED;
        vx = (vx / speed) * target;
        vy = (vy / speed) * target;
      }

      // brick collisions
      for (const b of bricks) {
        if (!b.alive) continue;
        if (ballX + BALL_RADIUS > b.x && ballX - BALL_RADIUS < b.x + b.w &&
            ballY + BALL_RADIUS > b.y && ballY - BALL_RADIUS < b.y + b.h) {
          b.alive = false;
          score += 10;
          ctx.setScore(score);
          // simple bounce: flip whichever side has more penetration
          const overlapX = Math.min(ballX + BALL_RADIUS - b.x, b.x + b.w - (ballX - BALL_RADIUS));
          const overlapY = Math.min(ballY + BALL_RADIUS - b.y, b.y + b.h - (ballY - BALL_RADIUS));
          if (overlapX < overlapY) vx = -vx;
          else vy = -vy;
          break;
        }
      }

      if (bricks.every((b) => !b.alive)) {
        ctx.win();
        return;
      }

      // bottom
      if (ballY > height + 20) {
        ctx.gameOver();
        return;
      }
    },

    draw(ctx: GameContext) {
      const { ctx: c, theme, height } = ctx;

      // bricks
      for (const b of bricks) {
        if (!b.alive) continue;
        Renderer.glow(c, b.color, 6, () => {
          Renderer.rect(c, b.x, b.y, b.w, b.h, b.color);
        });
      }

      // paddle
      const paddleY = height - PADDLE_Y_OFFSET - PADDLE_H;
      Renderer.glow(c, theme.accent, 8, () => {
        Renderer.rect(c, paddleX, paddleY, PADDLE_W, PADDLE_H, theme.accent);
      });

      // ball
      Renderer.glow(c, theme.fg, 10, () => {
        Renderer.circle(c, ballX, ballY, BALL_RADIUS, theme.fg);
      });

      if (!launched) {
        Renderer.text(c, 'Press SPACE / TAP to launch', ctx.width / 2, ctx.height - 8, {
          color: theme.muted, size: 11, font: theme.font, align: 'center',
        });
      }
    },
  };
}
