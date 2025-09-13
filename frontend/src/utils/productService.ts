import axios, { AxiosResponse } from 'axios';
import { Product, CreateProductData, PaginatedResponse, ApiResponse, SearchParams } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ProductService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/products`;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getProducts(params: SearchParams): Promise<PaginatedResponse<Product>> {
    const response: AxiosResponse<PaginatedResponse<Product>> = await axios.get(
      this.baseURL,
      {
        params,
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response: AxiosResponse<ApiResponse<Product>> = await axios.get(
      `${this.baseURL}/${id}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    const response: AxiosResponse<ApiResponse<Product>> = await axios.post(
      this.baseURL,
      productData,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async updateProduct(id: string, productData: Partial<CreateProductData>): Promise<ApiResponse<Product>> {
    const response: AxiosResponse<ApiResponse<Product>> = await axios.put(
      `${this.baseURL}/${id}`,
      productData,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await axios.delete(
      `${this.baseURL}/${id}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    const response: AxiosResponse<ApiResponse<Product[]>> = await axios.get(
      `${this.baseURL}/low-stock`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async bulkUpdateProducts(updates: { id: string; data: Partial<CreateProductData> }[]): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await axios.put(
      `${this.baseURL}/bulk-update`,
      { updates },
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async bulkDeleteProducts(ids: string[]): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await axios.delete(
      `${this.baseURL}/bulk-delete`,
      {
        data: { ids },
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }
}

export default new ProductService();