// frontend/types/index.ts
export interface Decision {
  id?: string;
  user_id?: string;
  title: string;
  context: string;
  options: string[];
  priorities: Priority[];
  created_at?: string;
  updated_at?: string;
}

export interface Priority {
  name: string;
  weight: number;
  description: string;
}

export interface AnalysisResult {
  decision_id?: string;
  scores: OptionScore[];
  summary: string;
  reasoning?: string;
  confidence: number;
  recommended_option: string;
}

export interface OptionScore {
  option: string;
  overall_score: number;
  priority_scores?: { [priority: string]: number };
}

export interface SavedDecision {
  id: string;
  user_id: string;
  title: string;
  context: string;
  options: string[];
  priorities: Priority[];
  analysis_result: AnalysisResult;
  created_at: string;
  updated_at: string;
}