/**
 * Computes readiness score (0–100) based on category coverage breadth and mock performance score.
 */
export function computeReadinessScore(categoriesCovered: string[], mockScores: number[]): number {
  const uniqueCategories = Array.from(new Set(categoriesCovered.map((c) => c.trim().toLowerCase())));
  const categoryWeight = Math.min(uniqueCategories.length / 5, 1) * 50; // Up to 50 points for covering 5 distinct categories

  const avgMock = mockScores.length
    ? mockScores.reduce((sum, val) => sum + val, 0) / mockScores.length
    : 5; // Default mid rating if no mock turns completed yet

  const performanceWeight = (Math.min(Math.max(avgMock, 0), 10) / 10) * 50; // Up to 50 points for quality

  return Math.round(categoryWeight + performanceWeight);
}
