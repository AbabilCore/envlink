import API_URL from "@/config";
import { ApiErrorResponse } from "@/types";

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    data?: unknown,
  ): Promise<T> {
    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const error: ApiErrorResponse = await response
        .json()
        .catch((): ApiErrorResponse => ({ message: "Request failed" }));
      throw new Error(
        error.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, "POST", data);
  }

  async get<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, "GET", data);
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, "PUT", data);
  }

  async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, "DELETE", data);
  }
}

export default new ApiClient();
