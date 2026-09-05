const ACCESS_TOKEN_KEY = 'dealflow360_access_token';
const REFRESH_TOKEN_KEY = 'dealflow360_refresh_token';
const USER_KEY = 'dealflow360_user';
const SIDEBAR_COLLAPSED_KEY = 'dealflow360_sidebar_collapsed';

export const tokenStorage = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setAccessToken(token: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to save access token', e);
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to save refresh token', e);
    }
  },

  setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  },

  clearTokens(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.error('Failed to clear tokens', e);
    }
  },

  getUserData<T>(): T | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUserData<T>(user: T): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  },

  // Sidebar persistence
  getSidebarCollapsed(): boolean {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setSidebarCollapsed(collapsed: boolean): void {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch (e) {
      console.error('Failed to save sidebar state', e);
    }
  },
};
