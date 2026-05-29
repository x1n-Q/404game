import type { InputState } from '../types';

const ACTION_KEYS = new Set([' ', 'Spacebar', 'Enter']);
const UP_KEYS = new Set(['ArrowUp', 'w', 'W']);
const DOWN_KEYS = new Set(['ArrowDown', 's', 'S']);
const LEFT_KEYS = new Set(['ArrowLeft', 'a', 'A']);
const RIGHT_KEYS = new Set(['ArrowRight', 'd', 'D']);

const SWIPE_THRESHOLD = 30;

export class Input {
  state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
    actionPressed: false,
    swipe: null,
    tap: false,
  };

  private actionWasPressed = false;
  private nextSwipe: InputState['swipe'] = null;
  private nextTap = false;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;

  private target: HTMLElement;
  private boundHandlers: { type: string; fn: EventListener; target: EventTarget }[] = [];

  constructor(target: HTMLElement) {
    this.target = target;
    this.attach();
  }

  private attach(): void {
    const onKeyDown = (e: KeyboardEvent) => {
      if (this.handleKey(e.key, true)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      this.handleKey(e.key, false);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
      this.touchStartTime = performance.now();
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - this.touchStartX;
      const dy = t.clientY - this.touchStartY;
      const elapsed = performance.now() - this.touchStartTime;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD && elapsed < 400) {
        this.nextTap = true;
        this.nextSwipe = null;
        this.actionWasPressed = true;
      } else if (absDx > absDy) {
        this.nextSwipe = dx > 0 ? 'right' : 'left';
      } else {
        this.nextSwipe = dy > 0 ? 'down' : 'up';
      }
      e.preventDefault();
    };

    const onMouseDown = (e: MouseEvent) => {
      this.nextTap = true;
      this.actionWasPressed = true;
      e.preventDefault();
    };

    this.addListener(window, 'keydown', onKeyDown as EventListener);
    this.addListener(window, 'keyup', onKeyUp as EventListener);
    this.addListener(this.target, 'touchstart', onTouchStart as EventListener, { passive: false });
    this.addListener(this.target, 'touchend', onTouchEnd as EventListener, { passive: false });
    this.addListener(this.target, 'mousedown', onMouseDown as EventListener);
  }

  private addListener(
    target: EventTarget,
    type: string,
    fn: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    target.addEventListener(type, fn, options);
    this.boundHandlers.push({ type, fn, target });
  }

  private handleKey(key: string, down: boolean): boolean {
    let handled = false;
    if (UP_KEYS.has(key)) {
      this.state.up = down;
      handled = true;
      if (down) this.nextSwipe = 'up';
    } else if (DOWN_KEYS.has(key)) {
      this.state.down = down;
      handled = true;
      if (down) this.nextSwipe = 'down';
    } else if (LEFT_KEYS.has(key)) {
      this.state.left = down;
      handled = true;
      if (down) this.nextSwipe = 'left';
    } else if (RIGHT_KEYS.has(key)) {
      this.state.right = down;
      handled = true;
      if (down) this.nextSwipe = 'right';
    } else if (ACTION_KEYS.has(key)) {
      const wasDown = this.state.action;
      this.state.action = down;
      if (down && !wasDown) this.actionWasPressed = true;
      handled = true;
    }
    return handled;
  }

  /** Called by Engine once per frame BEFORE update. */
  beginFrame(): void {
    this.state.actionPressed = this.actionWasPressed;
    this.state.swipe = this.nextSwipe;
    this.state.tap = this.nextTap;
  }

  /** Called by Engine once per frame AFTER update. */
  endFrame(): void {
    this.actionWasPressed = false;
    this.nextSwipe = null;
    this.nextTap = false;
  }

  destroy(): void {
    for (const { target, type, fn } of this.boundHandlers) {
      target.removeEventListener(type, fn);
    }
    this.boundHandlers = [];
  }
}
