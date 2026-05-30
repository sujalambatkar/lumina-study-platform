import type {
  TokenResponse,
  Document,
  DocumentStatusResponse,
  URLIngestionRequest,
  QuizGenerateResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
  ConceptMapResponse,
  TopicMastery,
  TrackerSummary,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
        credentials: "include",
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Backend is taking too long to respond. If this is the first request, wait 30 seconds and try again.");
      }
      throw new Error("Cannot reach server — make sure the backend is running on port 8000");
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // Auth
  async register(email: string, password: string, name: string): Promise<TokenResponse> {
    return this.request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    return this.request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>("/auth/logout", { method: "POST" });
  }

  async getMe(): Promise<TokenResponse["user"]> {
    return this.request<TokenResponse["user"]>("/auth/me");
  }

  // Documents
  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json() as Promise<Document>;
  }

  async ingestUrl(payload: URLIngestionRequest): Promise<Document> {
    return this.request<Document>("/documents/url", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async listDocuments(): Promise<Document[]> {
    return this.request<Document[]>("/documents/");
  }

  async getDocument(id: string): Promise<Document> {
    return this.request<Document>(`/documents/${id}`);
  }

  async getDocumentStatus(id: string): Promise<DocumentStatusResponse> {
    return this.request<DocumentStatusResponse>(`/documents/${id}/status`);
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request<void>(`/documents/${id}`, { method: "DELETE" });
  }

  // Quiz
  async generateQuiz(document_id: string, topic: string, count = 5): Promise<QuizGenerateResponse> {
    return this.request<QuizGenerateResponse>("/quiz/generate", {
      method: "POST",
      body: JSON.stringify({ document_id, topic, count }),
    });
  }

  async submitQuiz(payload: QuizSubmitRequest): Promise<QuizSubmitResponse> {
    return this.request<QuizSubmitResponse>("/quiz/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Concepts
  async generateConceptMap(document_id: string): Promise<ConceptMapResponse> {
    return this.request<ConceptMapResponse>("/concepts/map", {
      method: "POST",
      body: JSON.stringify({ document_id }),
    });
  }

  // Tracker
  async getDocumentTracker(document_id: string): Promise<TopicMastery[]> {
    return this.request<TopicMastery[]>(`/tracker/${document_id}`);
  }

  async getTrackerSummary(): Promise<TrackerSummary> {
    return this.request<TrackerSummary>("/tracker/summary/all");
  }

  // Chat streaming URL builder
  getChatStreamUrl(document_id: string, message: string): string {
    const encoded = encodeURIComponent(message);
    return `${this.baseUrl}/chat/stream?document_id=${document_id}&message=${encoded}`;
  }
}

export const api = new ApiClient(API_URL);
