import type { GameContext, GameModule } from '../types';
import { Renderer } from '../core/Renderer';

interface Vec { x: number; y: number; }
type Dir = 'up' | 'down' | 'left' | 'right';

const CELL = 16;
const TICK = 0.12; // seconds per move

export function createSnake(): GameModule {
  let cols = 0;
  let rows = 0;
  let snake: Vec[] = [];
  let dir: Dir = 'right';
  let queuedDir: Dir = 'right';
  let food: Vec = { x: 0, y: 0 };
  let acc = 0;
  let score = 0;

  function spawnFood(): void {
    while (true) {
      const f = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
      if (!snake.some((s) => s.x === f.x && s.y === f.y)) {
        food = f;
        return;
      }
    }
  }

  function turn(d: Dir): void {
    const opposites: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (opposites[d] !== dir) queuedDir = d;
  }

  return {
    name: 'snake',
    init(ctx: GameContext) {
      cols = Math.floor(ctx.width / CELL);
      rows = Math.floor(ctx.height / CELL);
      const cx = Math.floor(cols / 2);
      const cy = Math.floor(rows / 2);
      snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      dir = 'right';
      queuedDir = 'right';
      acc = 0;
      score = 0;
      spawnFood();
      ctx.setScore(0);
    },

    update(ctx: GameContext) {
      const { input } = ctx;
      if (input.swipe === 'up' || input.up) turn('up');
      else if (input.swipe === 'down' || input.down) turn('down');
      else if (input.swipe === 'left' || input.left) turn('left');
      else if (input.swipe === 'right' || input.right) turn('right');

      acc += ctx.dt;
      while (acc >= TICK) {
        acc -= TICK;
        dir = queuedDir;
        const head = snake[0]!;
        const nh: Vec = { x: head.x, y: head.y };
        if (dir === 'up') nh.y -= 1;
        else if (dir === 'down') nh.y += 1;
        else if (dir === 'left') nh.x -= 1;
        else if (dir === 'right') nh.x += 1;

        if (nh.x < 0 || nh.x >= cols || nh.y < 0 || nh.y >= rows) {
          ctx.gameOver();
          return;
        }
        if (snake.some((s) => s.x === nh.x && s.y === nh.y)) {
          ctx.gameOver();
          return;
        }
        snake.unshift(nh);
        if (nh.x === food.x && nh.y === food.y) {
          score += 10;
          ctx.setScore(score);
          spawnFood();
        } else {
          snake.pop();
        }
      }
    },

    draw(ctx: GameContext) {
      const { ctx: c, theme } = ctx;

      // grid hint
      c.strokeStyle = theme.muted + '22';
      c.lineWidth = 1;
      for (let x = 0; x <= cols; x++) {
        c.beginPath(); c.moveTo(x * CELL, 0); c.lineTo(x * CELL, rows * CELL); c.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        c.beginPath(); c.moveTo(0, y * CELL); c.lineTo(cols * CELL, y * CELL); c.stroke();
      }

      // food
      Renderer.glow(c, theme.danger, 12, () => {
        Renderer.circle(c, food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, theme.danger);
      });

      // snake
      Renderer.glow(c, theme.accent, 8, () => {
        for (let i = 0; i < snake.length; i++) {
          const s = snake[i]!;
          Renderer.rect(c, s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, i === 0 ? theme.accent : theme.accent + 'cc');
        }
      });
    },
  };
}
