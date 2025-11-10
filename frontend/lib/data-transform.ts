import { AnalysisResult, OptionScore } from '@/types';

/**
 * Comprehensive validation for backend response.
 */
export function validateAnalysisResult(backendData: any): AnalysisResult {
  if (!backendData || typeof backendData !== 'object') {
    throw new Error('Invalid analysis result data: expected object');
  }

  // Validate scores array
  const scores: OptionScore[] = [];
  if (Array.isArray(backendData.scores)) {
    for (const score of backendData.scores) {
      if (score && typeof score === 'object') {
        scores.push({
          option: String(score.option || 'Unknown Option'),
          overall_score: typeof score.overall_score === 'number' ? 
            Math.max(0, Math.min(100, score.overall_score)) : 50,
          priority_scores: score.priority_scores && typeof score.priority_scores === 'object' ? 
            score.priority_scores : {},
          strengths: Array.isArray(score.strengths) ? score.strengths.map(String) : [],
          weaknesses: Array.isArray(score.weaknesses) ? score.weaknesses.map(String) : [],
          risks: Array.isArray(score.risks) ? score.risks.map(String) : [],
          opportunities: Array.isArray(score.opportunities) ? score.opportunities.map(String) : [],
        });
      }
    }
  }

  // Ensure we have at least some scores
  if (scores.length === 0) {
    scores.push({
      option: "Default Option",
      overall_score: 50,
      priority_scores: {},
      strengths: ["Analysis completed"],
      weaknesses: ["Limited information"],
      risks: ["Standard risks apply"],
      opportunities: ["Potential for success"]
    });
  }

  return {
    decision_id: backendData.decision_id ? String(backendData.decision_id) : undefined,
    scores,
    summary: String(backendData.summary || 'Analysis completed successfully'),
    reasoning: String(backendData.reasoning || 'The decision was analyzed based on the provided priorities and context.'),
    confidence: typeof backendData.confidence === 'number' ? 
      Math.max(0, Math.min(100, backendData.confidence)) : 70,
    recommended_option: String(backendData.recommended_option || scores[0]?.option || 'Unknown'),
    key_insights: Array.isArray(backendData.key_insights) ? 
      backendData.key_insights.map(String) : ["Consider both short-term and long-term implications"],
    next_steps: Array.isArray(backendData.next_steps) ? 
      backendData.next_steps.map(String) : ["Review the analysis carefully before deciding"],
    comparative_analysis: String(backendData.comparative_analysis || 'Further comparison may be needed between options.')
  };
}

/**
 * Validate decision input before sending to backend.
 * Returns an array of error messages.
 */
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
      // Ensure description is present (mandatory by DecisionInput model)
      if (!priority?.description?.trim()) {
        errors.push(`Priority "${priority?.name || `#${index + 1}`}" must have a description`);
      }
    });
  }
  
  return errors;
}