export const buildHomeCardSummary = (summary: string): string | null => {
  const normalized = summary.trim();
  if (!normalized) {
    return null;
  }

  return `"${normalized}"`;
};
