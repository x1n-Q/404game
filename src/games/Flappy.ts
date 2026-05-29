import type { GameContext, GameModule } from '../types';
import { Renderer } from '../core/Renderer';

interface Pipe { x: number; gapY: number; passed: boolean; }

const GRAVITY = 1400;
const FLAP_VELOCITY = -380;
const PIPE_WIDTH = 50;
const PIPE_GAP = 130;
const PIPE_SPACING = 200;
const PIPE_SPEED = 160;
const BIRD_RADIUS = 12;

export function createFlappy(): GameModule {
  let birdY = 0;
  let birdX = 0;
  let velocity = 0;
  let pipes: Pipe[] = [];
  let score = 0;
  let spawnAcc = 0;

  return {
    name: 'flappy',
    init(ctx: GameContext) {
      birdX = ctx.width * 0.25;
      birdY = ctx.height / 2;
      velocity = 0;
      pipes = [];
      score = 0;
      spawnAcc = PIPE_SPACING; // spawn first immediately
      ctx.setScore(0);
    },

    update(ctx: GameContext) {
      const { input, dt, width, height } = ctx;

      if (input.actionPressed || input.tap || input.swipe === 'up') {
        velocity = FLAP_VELOCITY;
      }

      velocity += GRAVITY * dt;
      birdY += velocity * dt;

      if (birdY > height - BIRD_RADIUS || birdY < BIRD_RADIUS) {
        ctx.gameOver();
        return;
      }

      // spawn pipes by distance
      spawnAcc += PIPE_SPEED * dt;
      if (spawnAcc >= PIPE_SPACING) {
        spawnAcc -= PIPE_SPACING;
        const gapY = 60 + Math.random() * (height - 120 - PIPE_GAP);
        pipes.push({ x: width + PIPE_WIDTH, gapY, passed: false });
      }

      for (const p of pipes) {
        p.x -= PIPE_SPEED * dt;
        if (!p.passed && p.x + PIPE_WIDTH < birdX) {
          p.passed = true;
          score += 1;
          ctx.setScore(score);
        }
        // collision
        if (birdX + BIRD_RADIUS > p.x && birdX - BIRD_RADIUS < p.x + PIPE_WIDTH) {
          if (birdY - BIRD_RADIUS < p.gapY || birdY + BIRD_RADIUS > p.gapY + PIPE_GAP) {
            ctx.gameOver();
            return;
          }
        }
      }
      pipes = pipes.filter((p) => p.x + PIPE_WIDTH > -10);
    },

    draw(ctx: GameContext) {
      const { ctx: c, theme, height } = ctx;

      // pipes
      Renderer.glow(c, theme.accent, 8, () => {
        for (const p of pipes) {
          Renderer.rect(c, p.x, 0, PIPE_WIDTH, p.gapY, theme.accent);
          Renderer.rect(c, p.x, p.gapY + PIPE_GAP, PIPE_WIDTH, height - (p.gapY + PIPE_GAP), theme.accent);
        }
      });

      // bird
      Renderer.glow(c, theme.danger, 12, () => {
        Renderer.circle(c, birdX, birdY, BIRD_RADIUS, theme.danger);
      });
      // eye
      Renderer.circle(c, birdX + 4, birdY - 3, 2, theme.bg);
    },
  };
}
