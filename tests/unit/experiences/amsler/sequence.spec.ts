import { describe, expect, it } from 'vitest'
import { buildSequence, createRandom, newSeed } from '../../../../src/experiences/amsler/lib/sequence'
import { cellsInRegion } from '../../../../src/experiences/amsler/lib/grid'

describe('createRandom', () => {
  it('is deterministic for a seed and returns values in [0, 1)', () => {
    const a = createRandom(42)
    const b = createRandom(42)
    for (let i = 0; i < 100; i++) {
      const value = a()
      expect(value).toBe(b())
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('newSeed', () => {
  it('returns a 32-bit unsigned integer', () => {
    const seed = newSeed()
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThan(2 ** 32)
  })
})

describe('buildSequence', () => {
  it('full scope, sequential: all 400 cells in row-major order', () => {
    const seq = buildSequence({ type: 'full' }, 'sequential')
    expect(seq).toHaveLength(400)
    expect(seq.slice(0, 3)).toEqual([0, 1, 2])
    expect(seq[399]).toBe(399)
  })

  it('full scope, random: a permutation that repeats for the same seed', () => {
    const a = buildSequence({ type: 'full' }, 'random', 7)
    const b = buildSequence({ type: 'full' }, 'random', 7)
    const c = buildSequence({ type: 'full' }, 'random', 8)
    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
    expect([...a].sort((x, y) => x - y)).toEqual(Array.from({ length: 400 }, (_, i) => i))
  })

  it('region scope: only cells in the region', () => {
    const seq = buildSequence({ type: 'region', region: 'center' }, 'random', 3)
    expect([...seq].sort((x, y) => x - y)).toEqual(cellsInRegion('center'))
  })

  it('sample scope: N distinct cells, sorted when sequential', () => {
    const seq = buildSequence({ type: 'sample', n: 50 }, 'sequential', 99)
    expect(seq).toHaveLength(50)
    expect(new Set(seq).size).toBe(50)
    expect(seq).toEqual([...seq].sort((x, y) => x - y))
    expect(buildSequence({ type: 'sample', n: 50 }, 'sequential', 99)).toEqual(seq)
  })

  it('requires a seed for random order or sample scope', () => {
    expect(() => buildSequence({ type: 'full' }, 'random')).toThrow()
    expect(() => buildSequence({ type: 'sample', n: 5 }, 'sequential')).toThrow()
  })
})
