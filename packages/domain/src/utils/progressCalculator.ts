/**
 * Calculates the count of valid answered questions from an answers object.
 * Ignores null, undefined, empty strings, and empty arrays.
 */
export function calculateAnsweredQuestionsCount(answers?: Record<string, unknown> | null): number {
  if (!answers || typeof answers !== 'object') {
    return 0;
  }

  return Object.keys(answers).filter((key) => {
    const value = answers[key];
    if (value === null || value === undefined || value === '') {
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }
    return true;
  }).length;
}
