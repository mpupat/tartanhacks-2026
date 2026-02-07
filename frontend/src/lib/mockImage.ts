export function getMockImage(seed: string) {
  // Deterministic, free, no API key, no storage
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;
}
