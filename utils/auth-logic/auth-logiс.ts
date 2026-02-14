export class AuthLogiс {
  private static readonly CODE_VERIFIER_KEY = 'openrouter_code_verifier';
  private static readonly API_KEY_KEY = 'openrouter_api_key';
  private static async generateCodeVerifier(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const binaryString = array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    const base64 = btoa(binaryString);
    return this.base64ToBase64Url(base64);
  }
  private static async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const binaryString = hashArray.map((byte) => String.fromCharCode(byte)).join('');
    const base64 = btoa(binaryString);
    return this.base64ToBase64Url(base64);
  }
  private static base64ToBase64Url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  private static async exchangeCodeForToken(code: string): Promise<string> {
    const verifier = localStorage.getItem(this.CODE_VERIFIER_KEY);
    if (!verifier) {
      throw new Error('Code verifier not found');
    }
    const response = await fetch('https://openrouter.ai/api/v1/auth/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        code_verifier: verifier,
        code_challenge_method: 'S256',
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    if (!data.key) {
      throw new Error('API key not received in response');
    }
    localStorage.setItem(this.API_KEY_KEY, data.key);
    localStorage.removeItem(this.CODE_VERIFIER_KEY);
    return data.key;
  }
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }
  private static getApiKey(): string | null {
    if (!this.isClient()) return null;
    return localStorage.getItem(this.API_KEY_KEY);
  }
  static isLoggedIn(): boolean {
    return !!this.getApiKey();
  }
  static async initiateAuthFlow(): Promise<void> {
    if (!this.getApiKey()) {
      const verifier = await this.generateCodeVerifier();
      const challenge = await this.generateCodeChallenge(verifier);
      localStorage.setItem(this.CODE_VERIFIER_KEY, verifier);
      const callbackUrl = window.location.origin + '/login';
      const authUrl = `https://openrouter.ai/auth?callback_url=${callbackUrl}&code_challenge=${challenge}&code_challenge_method=S256`;
      window.location.href = authUrl;
    } else window.location.href = '/';
  }
  static async handleAuthCallback(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (!code) return false;
    try {
      await this.exchangeCodeForToken(code);
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = '/';
      return true;
    } catch (err) {
      return false;
    }
  }
}
