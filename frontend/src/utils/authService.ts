import axios, { AxiosResponse } from 'axios';
import { LoginCredentials, AuthResponse, User, ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/auth`;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await axios.post(
      `${this.baseURL}/login`,
      credentials
    );
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const token = localStorage.getItem('token');
    const response: AxiosResponse<ApiResponse> = await axios.post(
      `${this.baseURL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async refreshToken(): Promise<{ data: { token: string; refreshToken: string } }> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response: AxiosResponse<{ data: { token: string; refreshToken: string } }> = await axios.post(
      `${this.baseURL}/refresh`,
      { refreshToken }
    );
    return response.data;
  }

  async getCurrentUser(): Promise<{ data: User }> {
    const token = localStorage.getItem('token');
    const response: AxiosResponse<{ data: User }> = await axios.get(
      `${this.baseURL}/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<{ data: User }> {
    const token = localStorage.getItem('token');
    const response: AxiosResponse<{ data: User }> = await axios.put(
      `${this.baseURL}/profile`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async changePassword(passwordData: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string; 
  }): Promise<ApiResponse> {
    const token = localStorage.getItem('token');
    const response: AxiosResponse<ApiResponse> = await axios.put(
      `${this.baseURL}/change-password`,
      passwordData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}

export default new AuthService();