import type { GameContext, GameModule } from '../types';
import { Renderer } from '../core/Renderer';

interface Obstacle { x: number; w: number; h: number; }

const GRAVITY = 2200;
const JUMP_VELOCITY = -780;
const DINO_W = 24;
const DINO_H = 28;
const GROUND_OFFSET = 30;
const BASE_SPEED = 240;

export function createDino(): GameModule {
  let dinoX = 0;
  let dinoY = 0;
  let velocity = 0;
  let groundY = 0;
  let obstacles: Obstacle[] = [];
  let spawnTimer = 0;
  let score = 0;
  let scoreAcc = 0;
  let speed = BASE_SPEED;

  return {
    name: 'dino',
    init(ctx: GameContext) {
      dinoX = 60;
      groundY = ctx.height - GROUND_OFFSET;
      dinoY = groundY - DINO_H;
      velocity = 0;
      obstacles = [];
      spawnTimer = 0.8;
      score = 0;
      scoreAcc = 0;
      speed = BASE_SPEED;
      ctx.setScore(0);
    },

    update(ctx: GameContext) {
      const { input, dt, width } = ctx;
      const onGround = dinoY >= groundY - DINO_H;

      if ((input.actionPressed || input.tap || input.swipe === 'up') && onGround) {
        velocity = JUMP_VELOCITY;
      }

      velocity += GRAVITY * dt;
      dinoY += velocity * dt;
      if (dinoY > groundY - DINO_H) {
        dinoY = groundY - DINO_H;
        velocity = 0;
      }

      // speed up over time
      speed += dt * 8;

      // score
      scoreAcc += dt * 10;
      if (scoreAcc >= 1) {
        const inc = Math.floor(scoreAcc);
        scoreAcc -= inc;
        score += inc;
        ctx.setScore(score);
      }

      // spawn obstacles
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const h = 22 + Math.random() * 28;
        const w = 12 + Math.random() * 16;
        obstacles.push({ x: width + 20, w, h });
        spawnTimer = 0.7 + Math.random() * 0.9 - Math.min(0.4, (speed - BASE_SPEED) / 1000);
        if (spawnTimer < 0.4) spawnTimer = 0.4;
      }

      for (const o of obstacles) o.x -= speed * dt;
      obstacles = obstacles.filter((o) => o.x + o.w > -10);

      // collision (axis-aligned)
      for (const o of obstacles) {
        const ox = o.x;
        const oy = groundY - o.h;
        if (
          dinoX + DINO_W > ox && dinoX < ox + o.w &&
          dinoY + DINO_H > oy && dinoY < oy + o.h
        ) {
          ctx.gameOver();
          return;
        }
      }
    },

    draw(ctx: GameContext) {
      const { ctx: c, theme, width } = ctx;

      // ground line
      c.strokeStyle = theme.muted;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, groundY + 0.5);
      c.lineTo(width, groundY + 0.5);
      c.stroke();

      // ground tick marks (parallax-ish)
      for (let i = 0; i < 20; i++) {
        const tx = ((i * 40) - (ctx.time * 80) % 40);
        Renderer.rect(c, tx, groundY + 4, 16, 2, theme.muted);
      }

      // obstacles (cacti)
      Renderer.glow(c, theme.danger, 6, () => {
        for (const o of obstacles) {
          Renderer.rect(c, o.x, groundY - o.h, o.w, o.h, theme.danger);
        }
      });

      // dino
      Renderer.glow(c, theme.accent, 10, () => {
        Renderer.rect(c, dinoX, dinoY, DINO_W, DINO_H, theme.accent);
      });
      // eye
      Renderer.rect(c, dinoX + DINO_W - 7, dinoY + 6, 3, 3, theme.bg);
    },
  };
}
