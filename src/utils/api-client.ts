import { ApiErrorResponse } from "@/types";
import { generateZKProof } from "@/lib/auth";
import ENV from "@/config";

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = ENV.API_URL;
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

      const errorMessage = ENV.IS_DEV
        ? error.message || `HTTP ${response.status}: ${response.statusText}`
        : "Something went wrong. Please try again.";

      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, "GET");
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, "POST", data);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, "PUT", data);
  }

  async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, "DELETE", data);
  }

  async authenticated<T>(
    method: string,
    endpoint: string,
    envlinkId: string,
    passwordHash: string,
    additionalData?: Record<string, unknown>,
  ): Promise<T> {
    const passwordProof = await generateZKProof(passwordHash, envlinkId);

    const requestData = {
      passwordProof,
      ...additionalData,
    };

    return this.request<T>(endpoint, method, requestData);
  }
}

export default new ApiClient();
