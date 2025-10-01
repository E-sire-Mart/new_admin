'use client';

import type { User } from '../../types/user';
import { isUser } from '../../types/user';
import apiClient from '../api-client';
import axios, { type AxiosError } from 'axios';

// Replace the hardcoded API_URL with an environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

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
  phone_number?: string;
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
  access_token?: string;
  message?: string;
  token_type?: string;
  expires_in?: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    username?: string;
  };
}

interface ApiResponseData {
  data: unknown;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string; success?: boolean; token?: string; needsVerification?: boolean }> {
    const { firstName, lastName, email, password, phone_number } = params;
    
    const data = {
      "data": {
        "attributes": {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          ...(phone_number && { phone_number })
        }
      }
    };

    try {
      // Make API request to admin registration endpoint
      const response = await axios.post<ApiResponse>(`${API_URL}/api/v1/auth/admin-register`, data);
      
      // Check if registration was successful and if a token was returned
      if (response.data.access_token) {
        // User is already verified and can be logged in immediately
        localStorage.setItem('custom-auth-token', response.data.access_token);
        
        // Store user data if available
        if (response.data.user) {
          const userData = {
            _id: response.data.user.id,
            email: response.data.user.email,
            first_name: response.data.user.firstName,
            last_name: response.data.user.lastName,
            isAdmin: response.data.user.isAdmin
          };
          localStorage.setItem('user-data', JSON.stringify(userData));
        }
        
        return { success: true, token: response.data.access_token };
      }
      
      // Registration successful but needs email verification
      return { success: true, needsVerification: true };
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error instanceof Error ? error.message : String(error));
      const err = error as AxiosError<{ message?: string }> | undefined;
      const msg = err?.response?.data?.message;
      if (typeof msg === 'string' && msg.length > 0) {
        return { error: msg };
      }
      
      return { error: 'Registration failed. Please try again.' };
    }
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
    
    try {
      // Make API request to admin login endpoint
      const response = await axios.post<ApiResponse>(`${API_URL}/api/v1/auth/admin-login`, data);
      console.log(response.data, "------------------------")
      
      // Use access_token from the response
      let access_token = response.data.access_token;
      console.log(access_token, "---------------")

      if (access_token) {
        localStorage.setItem('custom-auth-token', access_token);
        
        // Store user data if available
        if (response.data.user) {
          const userData = {
            _id: response.data.user.id,
            email: response.data.user.email,
            first_name: response.data.user.firstName,
            last_name: response.data.user.lastName,
            isAdmin: response.data.user.isAdmin
          };
          localStorage.setItem('user-data', JSON.stringify(userData));
        }
        
        return {};
      }
      return { error: 'Invalid credentials' };
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Login error:', error instanceof Error ? error.message : String(error));
      const err = error as AxiosError<{ message?: string }>;
      if (err.response?.data?.message) {
        return { error: err.response.data.message };
      }
      
      return { error: 'Login failed. Please try again.' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      // Check if we have a token
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        return { data: null };
      }

      // Try to get user profile from backend
      try {
        const response = await apiClient.get<ApiResponseData>('/users/profile');
        
        if (response.data.data && isUser(response.data.data)) {
          return { data: response.data.data };
        }
      } catch (profileError) {
        // eslint-disable-next-line no-console
        console.log('Profile endpoint not available, using stored user data');
      }

      // Fallback: Try to get stored user data first
      try {
        const storedUserData = localStorage.getItem('user-data');
        if (storedUserData) {
          const user = JSON.parse(storedUserData);
          if (isUser(user)) {
            return { data: user };
          }
        }
      } catch (storedDataError) {
        // eslint-disable-next-line no-console
        console.log('No stored user data available');
      }

      // Last fallback: Try to decode JWT token to get user info
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          _id: tokenPayload.userId || tokenPayload.id,
          email: tokenPayload.email,
          first_name: tokenPayload.first_name || tokenPayload.firstName,
          last_name: tokenPayload.last_name || tokenPayload.lastName,
          // Add other fields as needed
        };
        
        return { data: user };
      } catch (jwtError) {
        // eslint-disable-next-line no-console
        console.error('Failed to decode JWT token:', jwtError);
        return { data: null };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('getUser error:', error);
      return { data: null };
    }
  }


  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user-data');

    return {};
  }
}

export const authClient = new AuthClient();
