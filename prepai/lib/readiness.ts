/**
 * Computes readiness score (0–100) based on category coverage breadth, topic self-assessments, and practice streaks.
 */
export function computeReadinessScore(categoriesCovered: string[], mockScores: number[]): number {
  const uniqueCategories = Array.from(new Set(categoriesCovered.map((c) => c.trim().toLowerCase())));
  const categoryWeight = Math.min(uniqueCategories.length / 5, 1) * 50; // Up to 50 points for covering 5 distinct categories

  const avgMock = mockScores.length
    ? mockScores.reduce((sum, val) => sum + val, 0) / mockScores.length
    : 6; // Default rating if no mock turns completed yet

  const performanceWeight = (Math.min(Math.max(avgMock, 0), 10) / 10) * 50; // Up to 50 points for quality

  return Math.min(100, Math.round(categoryWeight + performanceWeight));
}

export function computeSessionReadiness(session: any, streak: number = 0): number {
  if (!session) return 65;
  const questions = Array.isArray(session.questions) ? session.questions : [];
  const categories = Array.from(new Set(questions.map((q: any) => q.category || "Technical")));
  const categoryScore = Math.min(categories.length / 4, 1) * 40; // Up to 40 pts

  const assessments = session.topic_assessments || {};
  const strongCount = Object.values(assessments).filter((v) => v === "strong").length;
  const totalTopics = (session.topics || []).length || 5;
  const topicScore = (strongCount / Math.max(1, totalTopics)) * 45; // Up to 45 pts

  const streakBonus = Math.min(streak * 3, 15); // Up to 15 pts

  return Math.min(100, Math.max(35, Math.round(categoryScore + topicScore + streakBonus)));
}
