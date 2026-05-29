const PREFIX = '404game.hs.';

export const Storage = {
  getHighscore(gameName: string): number {
    try {
      const v = localStorage.getItem(PREFIX + gameName);
      return v ? parseInt(v, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  setHighscore(gameName: string, score: number): boolean {
    try {
      const prev = Storage.getHighscore(gameName);
      if (score > prev) {
        localStorage.setItem(PREFIX + gameName, String(score));
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  },
};
