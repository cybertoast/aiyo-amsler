import { describe, expect, it } from 'vitest'
import { summarizeResponses } from '../../../../src/experiences/amsler/lib/results'
import { EMPTY_RESPONSES } from '../../../../src/experiences/amsler/lib/session-schema'

describe('summarizeResponses', () => {
  it('counts each response and lists blurry and invisible cells', () => {
    const chars = EMPTY_RESPONSES.split('')
    chars[0] = 'c'
    chars[1] = 'b'
    chars[21] = 'i'
    chars[399] = 'b'
    const summary = summarizeResponses(chars.join(''))
    expect(summary.counts).toEqual({ clear: 1, blurry: 2, invisible: 1, untested: 396 })
    expect(summary.tested).toBe(4)
    expect(summary.blurry).toEqual(['B1', 'T20'])
    expect(summary.invisible).toEqual(['B2'])
  })
})
