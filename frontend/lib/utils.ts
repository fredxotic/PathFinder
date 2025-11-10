import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
// Import the comprehensive validation logic from data-transform
import { validateDecisionInput as validateDecisionInputFull } from "./data-transform"


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

// Rename the local implementation to avoid conflict
// And re-export the consolidated one under the standard name
export const validateDecisionInput = validateDecisionInputFull;


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