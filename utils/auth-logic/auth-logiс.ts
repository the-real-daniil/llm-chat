const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export class AuthLogic {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  static async getMe(): Promise<{ id: string } | null> {
    if (!this.isClient()) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401) {
        return null;
      }

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data.data;
    } catch {
      return null;
    }
  }

  static initiateAuthFlow(): void {
    if (!this.isClient()) return;
    window.location.href = `${API_BASE}/auth/start`;
  }

  static async logout(): Promise<void> {
    if (!this.isClient()) return;

    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      localStorage.clear();
      sessionStorage.clear();

      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  }

  static async isLoggedIn(): Promise<boolean> {
    const user = await this.getMe();
    return !!user;
  }
}
