'use client';

import type { User } from '../../types/user';
import { isUser } from '../../types/user';
import apiClient from '../api-client';
import axios from 'axios';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

interface ApiResponse {
  access_token: string;
}

interface ApiResponseData {
  data: unknown;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;
    const data = {
      "data": {
        "attributes": {
          email,
          password
        }
      }
    }
    // Make API request
    const response = await axios.post<ApiResponse>('http://localhost:3003/api/v1/auth/loginAsAdmin', data);
    const token = response.data.access_token;

    if (token) {
      localStorage.setItem('custom-auth-token', token);
      return {};
    }
    return { error: 'Invalid credentials' };
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      // Make API request
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        return { data: null };
      }

      const response = await apiClient.get<ApiResponseData>('/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.data || !isUser(response.data.data)) {
        return { error: 'Invalid data format' };
      }

      return { data: response.data.data };
    } catch (error) {
      return { data: null };
    }
  }


  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');

    return {};
  }
}

export const authClient = new AuthClient();
