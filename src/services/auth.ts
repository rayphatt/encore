import axios from 'axios';

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// Hardcode the API URL for now
const API_URL = 'http://localhost:3000/api';

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  private clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return this.token;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
      const { user, token } = response.data;
      this.setToken(token);
      return { user, token };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, credentials);
      const { user, token } = response.data;
      this.setToken(token);
      return { user, token };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginWithGoogle(): Promise<void> {
    window.location.href = `${API_URL}/auth/google`;
  }

  async loginWithApple(): Promise<void> {
    window.location.href = `${API_URL}/auth/apple`;
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await axios.post(`${API_URL}/auth/logout`, null, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null; // No token means no user logged in
    }

    try {
      const response = await axios.get<User>(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error) {
      this.clearToken();
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    const axiosError = error as { response?: { data?: { message?: string }; }; message?: string; };
    if (axiosError.response?.data?.message) {
      return new Error(axiosError.response.data.message);
    }
    if (axiosError.message) {
      return new Error(axiosError.message);
    }
    return new Error('An unknown error occurred');
  }
}

export const authService = new AuthService(); 