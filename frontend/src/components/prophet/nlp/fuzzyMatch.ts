/**
 * NLP — Fuzzy matching via Levenshtein distance
 */

export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }

  return dp[m][n]
}

export function fuzzyFind(
  input: string,
  candidates: string[],
  maxDistance = 2,
): string | undefined {
  let bestMatch: string | undefined
  let bestDist = maxDistance + 1

  for (const candidate of candidates) {
    const dist = levenshtein(input.toLowerCase(), candidate.toLowerCase())
    if (dist < bestDist) {
      bestDist = dist
      bestMatch = candidate
    }
  }

  return bestDist <= maxDistance ? bestMatch : undefined
}
