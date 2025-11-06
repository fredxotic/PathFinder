import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateConfidence(scores: number[]): number {
  if (!scores || !Array.isArray(scores) || scores.length < 2) return 50;
  
  const validScores = scores
    .filter(score => typeof score === 'number' && !isNaN(score))
    .map(score => Math.max(0, score)); // Ensure non-negative
  
  if (validScores.length < 2) return 50;
  
  const maxScore = Math.max(...validScores);
  const minScore = Math.min(...validScores);
  const range = maxScore - minScore;
  
  if (range === 0) return 50;
  
  // Calculate confidence based on score differentiation
  const normalizedRange = (range / 100) * 70;
  const confidence = Math.min(30 + normalizedRange, 95);
  
  return Math.round(confidence);
}

export function validateDecisionInput(decision: any): string[] {
  const errors: string[] = [];
  
  if (!decision?.title?.trim()) {
    errors.push("Decision title is required");
  } else if (decision.title.length > 200) {
    errors.push("Decision title must be less than 200 characters");
  }
  
  if (!decision?.context?.trim()) {
    errors.push("Context is required");
  } else if (decision.context.length < 10) {
    errors.push("Context must be at least 10 characters");
  } else if (decision.context.length > 2000) {
    errors.push("Context must be less than 2000 characters");
  }
  
  const validOptions = decision?.options?.filter((opt: string) => opt?.trim().length > 0) || [];
  if (validOptions.length < 2) {
    errors.push("At least 2 options are required");
  }
  
  if (validOptions.length > 5) {
    errors.push("Maximum 5 options allowed");
  }
  
  if (!decision?.priorities || !Array.isArray(decision.priorities) || decision.priorities.length === 0) {
    errors.push("At least one priority is required");
  } else {
    decision.priorities.forEach((priority: any, index: number) => {
      if (!priority?.name?.trim()) {
        errors.push(`Priority ${index + 1} must have a name`);
      }
      if (typeof priority?.weight !== 'number' || priority.weight < 1 || priority.weight > 10) {
        errors.push(`Priority "${priority?.name || `#${index + 1}`}" must have a weight between 1-10`);
      }
    });
  }
  
  return errors;
}

// Format date consistently
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Safe number formatting
export function formatNumber(value: number, decimals: number = 1): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toFixed(decimals);
}