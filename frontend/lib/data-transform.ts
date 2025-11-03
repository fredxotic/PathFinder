import { AnalysisResult } from '@/types';

/**
 * Simple validation and type assertion for backend response
 */
export function validateAnalysisResult(backendData: any): AnalysisResult {
  if (!backendData || typeof backendData !== 'object') {
    throw new Error('Invalid analysis result data');
  }

  return {
    decision_id: backendData.decision_id,
    scores: Array.isArray(backendData.scores) ? backendData.scores : [],
    summary: backendData.summary || '',
    reasoning: backendData.reasoning,
    confidence: backendData.confidence || 50,
    recommended_option: backendData.recommended_option || ''
  };
}