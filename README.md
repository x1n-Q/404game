# 404game.js

> Turn boring 404 pages into playable mini-games. Drop-in, zero dependencies, < 30KB.

```html
<script src="404game.js"></script>
<div id="game"></div>
<script>Game404.mount('#game');</script>
```

That's it. Your 404 page now has Snake, Flappy Bird, Breakout, or a Dino runner.

---

## 🎮 Games included

| Game | Controls (Desktop) | Controls (Mobile) |
|------|------|------|
| 🐍 **Snake** | Arrow keys | Swipe |
| 🐦 **Flappy** | Space / Click | Tap |
| 🧱 **Breakout** | Arrow keys + Space | Swipe + Tap |
| 🦖 **Dino** | Space | Tap |

Plus 4 themes: `neon`, `retro`, `minimal`, `dark`.

---

## 📦 Install

```bash
npm install 404game
```

or use the CDN-style UMD bundle:

```html
<script src="https://unpkg.com/404game/dist/404game.umd.cjs"></script>
```

---

## 🚀 Usage

### Vanilla / `<script>` tag

```html
<div id="game"></div>
<script src="404game.umd.cjs"></script>
<script>
  Game404.mount('#game', {
    game: 'random',   // 'snake' | 'flappy' | 'breakout' | 'dino' | 'random'
    theme: 'neon',    // 'neon'  | 'retro'  | 'minimal'  | 'dark'
  });
</script>
```

### ES Modules / bundlers

```js
import Game404 from '404game';

Game404.mount('#game', { game: 'snake' });
```

### React

```jsx
import { useEffect, useRef } from 'react';
import Game404 from '404game';

function NotFoundPage() {
  const ref = useRef(null);
  useEffect(() => {
    const instance = Game404.mount(ref.current, { game: 'random' });
    return () => instance.destroy();
  }, []);
  return <div ref={ref} />;
}
```

---

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `game` | `'snake' \| 'flappy' \| 'breakout' \| 'dino' \| 'random'` | `'random'` | Which game to load |
| `theme` | `'neon' \| 'retro' \| 'minimal' \| 'dark'` | `'neon'` | Visual theme |
| `width` | `number` | container width or 480 | Canvas width (px) |
| `height` | `number` | `360` | Canvas height (px) |
| `message` | `string` | `'404 — Page Not Found'` | Big banner text |
| `subMessage` | `string` | `'But hey, want to play instead?'` | Small banner text |
| `showHighscore` | `boolean` | `true` | Show "Best" score in HUD |
| `autoStart` | `boolean` | `false` | Skip start screen |
| `onStart` | `() => void` | — | Fired when player starts |
| `onScore` | `(score: number) => void` | — | Fired on every score update |
| `onGameOver` | `(score: number) => void` | — | Fired when player loses |
| `onWin` | `(score: number) => void` | — | Fired when player wins (Breakout) |

---

## 🔧 API

```ts
const instance = Game404.mount(selector, options);

instance.restart();        // Restart current game
instance.getScore();       // Current score
instance.destroy();        // Remove from DOM, free resources

Game404.unmount(selector); // Same as instance.destroy()

Game404.games;             // ['snake', 'flappy', 'breakout', 'dino']
Game404.version;           // '0.1.0'
```

---

## ✨ Features

- 🎮 **4 classic games** built in
- 🎨 **4 themes** included
- 📱 **Touch + keyboard** controls — works everywhere
- 💾 **Local high scores** per game
- 🪶 **Zero dependencies** — pure browser APIs
- 📦 **< 30KB** minified + gzipped
- 🧩 **TypeScript** types included
- ♻️ **Auto-cleanup** with `destroy()`
- 🎯 **Framework-friendly** (React, Vue, Svelte, vanilla, anywhere)

---

## 🛠️ Development

```bash
npm install
npm run dev        # Vite dev server at http://localhost:5173
npm run build      # Build to dist/
npm run preview    # Preview built demo at http://localhost:4173
```

Open `demo/index.html` after building to see all 4 games at once.
Open `demo/404.html` to see a real-world 404 page integration.

---

## 📄 License

MIT
