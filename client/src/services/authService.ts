import { env } from '../config/env';
import type { ApiResponse } from '../types';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  college: string;
  collegeDomain: string;
  branch: string;
  graduationYear: string;
  avatar: string;
  role: 'STUDENT' | 'MODERATOR' | 'COLLEGE_ADMIN' | 'SUPER_ADMIN';
  verificationStatus: 'UNVERIFIED' | 'EMAIL_VERIFIED' | 'STUDENT_VERIFIED';
  trustScore: number;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: AuthUser;
  tokens: AuthTokens;
}

const ACCESS_TOKEN_KEY = 'collex_access_token';
const REFRESH_TOKEN_KEY = 'collex_refresh_token';
const USER_KEY = 'collex_user_profile';

export const authService = {
  getStoredTokens(): AuthTokens | null {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  saveSession(user: AuthUser, tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    college: string;
    branch: string;
    graduationYear: string;
    avatar?: string;
  }): Promise<AuthResponseData> {
    const response = await fetch(`${env.apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const resData: ApiResponse<AuthResponseData> = await response.json();
    if (!response.ok || !resData.success) {
      throw new Error(resData.message || 'Registration failed');
    }

    this.saveSession(resData.data.user, resData.data.tokens);
    return resData.data;
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponseData> {
    const response = await fetch(`${env.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const resData: ApiResponse<AuthResponseData> = await response.json();
    if (!response.ok || !resData.success) {
      throw new Error(resData.message || 'Invalid email or password');
    }

    this.saveSession(resData.data.user, resData.data.tokens);
    return resData.data;
  },

  async logout(): Promise<void> {
    const tokens = this.getStoredTokens();
    if (tokens?.accessToken) {
      try {
        await fetch(`${env.apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
      } catch {
        // Silently clear local session
      }
    }
    this.clearSession();
  },

  async getMe(): Promise<AuthUser | null> {
    const tokens = this.getStoredTokens();
    if (!tokens?.accessToken) return null;

    try {
      const response = await fetch(`${env.apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      const resData: ApiResponse<{ user: AuthUser }> = await response.json();
      if (!response.ok || !resData.success) {
        return null;
      }

      localStorage.setItem(USER_KEY, JSON.stringify(resData.data.user));
      return resData.data.user;
    } catch {
      return null;
    }
  },
};
