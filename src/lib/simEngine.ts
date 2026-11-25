export const TICK_MS = 2000

export function startSimEngine(doTick: () => void): () => void {
  const id = setInterval(doTick, TICK_MS)
  return () => clearInterval(id)   // cleanup function
}
