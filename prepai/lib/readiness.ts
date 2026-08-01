export interface ReadinessInputs {
  mockScores?: number[];
  totalQuestions?: number;
  reviewedQuestionsCount?: number;
  strongTopicsCount?: number;
  weakTopicsCount?: number;
  streakDays?: number;
}

export interface ComputedReadinessResult {
  score: number;
  label: string;
  colorClass: string;
  badgeBg: string;
  riskNotice: string;
}

/**
 * Computes a performance-weighted readiness score (0-100%) factoring in:
 * 1. Mock Interview Turn Performance (40% Weight)
 * 2. Question Review Ratio & Precise Answers (30% Weight)
 * 3. Topic Self-Assessments Strong vs Weak (20% Weight)
 * 4. Practice Consistency / Streak Days (10% Weight)
 */
export function computePerformanceReadiness(inputs: ReadinessInputs): ComputedReadinessResult {
  const {
    mockScores = [],
    totalQuestions = 1,
    reviewedQuestionsCount = 0,
    strongTopicsCount = 0,
    weakTopicsCount = 0,
    streakDays = 0,
  } = inputs;

  // 1. Mock Score Component (40 pts max)
  let mockComponent = 20; // Default baseline if no mock turns taken yet
  if (mockScores.length > 0) {
    const avg = mockScores.reduce((a, b) => a + b, 0) / mockScores.length;
    mockComponent = (Math.min(Math.max(avg, 0), 10) / 10) * 40;
  }

  // 2. Review Ratio Component (30 pts max)
  const reviewRatio = Math.min(reviewedQuestionsCount / Math.max(totalQuestions, 1), 1);
  const reviewComponent = reviewRatio * 30;

  // 3. Topic Self-Assessment Component (20 pts max)
  const totalTopics = strongTopicsCount + weakTopicsCount;
  let topicComponent = 10;
  if (totalTopics > 0) {
    topicComponent = (strongTopicsCount / totalTopics) * 20;
  }

  // 4. Streak Component (10 pts max)
  const streakComponent = Math.min(streakDays * 2, 10);

  const finalScore = Math.min(Math.round(mockComponent + reviewComponent + topicComponent + streakComponent), 100);

  if (finalScore >= 80) {
    return {
      score: finalScore,
      label: "Interview Ready",
      colorClass: "text-mint border-mint/40 bg-mint/10",
      badgeBg: "bg-mint",
      riskNotice: "High confidence! Your background and mock turn performance match senior standards.",
    };
  }

  if (finalScore >= 60) {
    return {
      score: finalScore,
      label: "Moderate Confidence",
      colorClass: "text-highlight border-highlight/40 bg-highlight/10",
      badgeBg: "bg-highlight",
      riskNotice: "Moderate preparation. Complete remaining mock turns and review weak topics.",
    };
  }

  return {
    score: finalScore,
    label: "Needs Practice",
    colorClass: "text-coral border-coral/40 bg-coral/10",
    badgeBg: "bg-coral",
    riskNotice: "Attention required! Complete mock practice sessions and review weak architecture areas.",
  };
}

export function computeReadinessScore(categoriesCovered: string[], mockScores: number[]): number {
  return computePerformanceReadiness({
    mockScores,
    totalQuestions: categoriesCovered.length,
    reviewedQuestionsCount: Math.min(categoriesCovered.length, 3),
  }).score;
}

export function computeSessionReadiness(session: any, streak: number = 0): number {
  if (!session) return 65;
  const questions = Array.isArray(session.questions) ? session.questions : [];
  const assessments = session.topic_assessments || {};
  const strongCount = Object.values(assessments).filter((v) => v === "strong").length;
  const weakCount = Object.values(assessments).filter((v) => v === "weak").length;

  return computePerformanceReadiness({
    totalQuestions: questions.length,
    reviewedQuestionsCount: questions.filter((q: any) => q.precise_answer).length,
    strongTopicsCount: strongCount,
    weakTopicsCount: weakCount,
    streakDays: streak,
  }).score;
}
