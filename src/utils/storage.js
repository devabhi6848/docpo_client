const TOKEN_KEY = 'docpa_tokens';
const USER_KEY = 'docpa_user';

export const storage = {
  getTokens: () => {
    try {
      const tokens = localStorage.getItem(TOKEN_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  },
  setTokens: (tokens) => {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    } catch (e) {
      console.error('Failed to save tokens to storage', e);
    }
  },
  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to storage', e);
    }
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
