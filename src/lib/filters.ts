export function filterBySearch<T>(
  items: readonly T[],
  query: string,
  getSearchableText: (item: T) => string,
): T[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [...items];
  return items.filter((item) =>
    getSearchableText(item).toLocaleLowerCase().includes(normalizedQuery),
  );
}
