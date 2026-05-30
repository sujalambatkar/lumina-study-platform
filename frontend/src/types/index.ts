export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type DocumentSourceType = "pdf" | "youtube" | "web";
export type DocumentStatus = "processing" | "ready" | "failed";

export interface Document {
  id: string;
  title: string;
  source_type: DocumentSourceType;
  source_url: string | null;
  status: DocumentStatus;
  progress: number;
  chunk_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentStatusResponse {
  status: DocumentStatus;
  progress: number;
  chunk_count: number;
  error_message: string | null;
}

export interface URLIngestionRequest {
  url: string;
  type: "youtube" | "web";
  title?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface QuizGenerateResponse {
  document_id: string;
  topic: string;
  questions: QuizQuestion[];
}

export interface QuizSubmitRequest {
  document_id: string;
  topic: string;
  score: number;
  total: number;
}

export interface QuizSubmitResponse {
  message: string;
  percentage: number;
}

export interface ConceptNode {
  id: string;
  label: string;
  description: string;
}

export interface ConceptEdge {
  source: string;
  target: string;
  label: string;
}

export interface ConceptMapResponse {
  document_id: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export type MasteryStatus = "needs_review" | "not_explored" | "strong";

export interface TopicMastery {
  topic: string;
  document_id: string;
  document_title: string;
  avg_score: number | null;
  attempt_count: number;
  last_attempt: string | null;
  status: MasteryStatus;
}

export interface TrackerSummary {
  total_topics: number;
  overall_mastery: number;
  needs_review_count: number;
  strong_count: number;
  not_explored_count: number;
}

export interface ApiError {
  detail: string;
}
