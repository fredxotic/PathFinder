import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateConfidence(scores: number[]): number {
  if (!scores || scores.length < 2) return 50;
  
  const validScores = scores.filter(score => typeof score === 'number' && !isNaN(score));
  if (validScores.length < 2) return 50;
  
  const maxScore = Math.max(...validScores);
  const minScore = Math.min(...validScores);
  const range = maxScore - minScore;
  
  if (range === 0) return 50;
  
  const normalizedRange = (range / 100) * 70;
  return Math.min(30 + normalizedRange, 95);
}

export function validateDecisionInput(decision: any): string[] {
  const errors: string[] = [];
  
  if (!decision.title?.trim()) {
    errors.push("Decision title is required");
  }
  
  if (!decision.context?.trim() || decision.context.length < 10) {
    errors.push("Context must be at least 10 characters");
  }
  
  const validOptions = decision.options?.filter((opt: string) => opt.trim().length > 0);
  if (!validOptions || validOptions.length < 2) {
    errors.push("At least 2 options are required");
  }
  
  if (validOptions && validOptions.length > 5) {
    errors.push("Maximum 5 options allowed");
  }
  
  if (!decision.priorities || decision.priorities.length === 0) {
    errors.push("At least one priority is required");
  }
  
  return errors;
}