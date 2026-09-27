import { CELL_COUNT, cellsInRegion } from './grid'
import type { Order, Scope } from './session-schema'

/** mulberry32: small seeded generator, so a stored seed reproduces the same order. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32
  }
}

export function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]!
}

function shuffle(values: number[], random: () => number): number[] {
  const out = [...values]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

export function needsSeed(scope: Scope, order: Order): boolean {
  return order === 'random' || scope.type === 'sample'
}

/** Cell indices to test, in the order they are shown. */
export function buildSequence(scope: Scope, order: Order, seed?: number): number[] {
  if (needsSeed(scope, order) && seed === undefined) throw new Error('A seed is required for random order or sample scope.')
  const random = seed === undefined ? null : createRandom(seed)
  let cells: number[]
  if (scope.type === 'full') cells = Array.from({ length: CELL_COUNT }, (_, i) => i)
  else if (scope.type === 'region') cells = cellsInRegion(scope.region)
  else cells = shuffle(Array.from({ length: CELL_COUNT }, (_, i) => i), random!).slice(0, scope.n)

  return order === 'random' ? shuffle(cells, random!) : [...cells].sort((a, b) => a - b)
}
