import { describe, expect, it } from 'vitest'
import {
  EMPTY_RESPONSES,
  createSession,
  defaultSessionName,
  parseSessionFile,
  sessionFileName,
  sessionToFileJson,
  validateSession,
  type Session,
} from '../../../../src/experiences/amsler/lib/session-schema'

const start = new Date('2026-09-27T09:30:00')

function sample(): Session {
  return createSession(
    {
      eye: 'left',
      color: 'red',
      theme: 'dark',
      displayMode: 'cell',
      order: 'random',
      scope: { type: 'sample', n: 50 },
      seed: 12345,
    },
    start,
  )
}

describe('createSession', () => {
  it('fills defaults and an empty response string', () => {
    const s = sample()
    expect(s.v).toBe(1)
    expect(s.x).toBe('amsler')
    expect(s.gridMm).toBe(100)
    expect(s.responses).toBe(EMPTY_RESPONSES)
    expect(s.responses).toHaveLength(400)
    expect(s.name).toBe('left-red-2026-09-27-0930')
    expect(s.startedAt).toMatch(/^2026-09-27T09:30:00[+-]\d{2}:\d{2}$/)
  })
})

describe('defaultSessionName', () => {
  it('combines eye, color, and local date and time', () => {
    expect(defaultSessionName('both', 'mono', start)).toBe('both-mono-2026-09-27-0930')
  })
})

describe('validateSession', () => {
  it('accepts a valid session', () => {
    const s = sample()
    expect(validateSession(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })

  it('accepts a session with blood pressure and notes', () => {
    const s = {
      ...sample(),
      bloodPressure: { systolic: 128, diastolic: 82, pulse: 70, takenAt: s0() },
      notes: 'after coffee',
    }
    expect(validateSession(s)).toEqual(s)
  })

  it.each([
    ['not an object', 'x'],
    ['newer version', { ...sample(), v: 2 }],
    ['wrong experience', { ...sample(), x: 'other' }],
    ['bad eye', { ...sample(), eye: 'middle' }],
    ['bad color', { ...sample(), color: 'purple' }],
    ['short responses', { ...sample(), responses: 'c' }],
    ['bad response code', { ...sample(), responses: 'x'.repeat(400) }],
    ['bad sample size', { ...sample(), scope: { type: 'sample', n: 0 } }],
    ['bad region', { ...sample(), scope: { type: 'region', region: 'N' } }],
    ['random order without seed', { ...sample(), seed: undefined }],
    ['bad date', { ...sample(), startedAt: 'yesterday' }],
    ['systolic out of range', { ...sample(), bloodPressure: { systolic: 20, diastolic: 80, takenAt: s0() } }],
    ['name too long', { ...sample(), name: 'a'.repeat(101) }],
  ])('rejects %s', (_label, value) => {
    expect(() => validateSession(value)).toThrow()
  })
})

describe('session files', () => {
  it('names files by eye, color, and timestamp', () => {
    expect(sessionFileName(sample())).toBe('amsler-left-red-20260927-0930.json')
  })

  it('round-trips through file JSON that includes the share URL', () => {
    const s = sample()
    const text = sessionToFileJson(s, 'https://example.test/amsler/review#s=abc')
    expect(JSON.parse(text).url).toBe('https://example.test/amsler/review#s=abc')
    expect(parseSessionFile(text)).toEqual(s)
  })

  it('rejects a file that is not JSON', () => {
    expect(() => parseSessionFile('{oops')).toThrow(/file/i)
  })
})

function s0(): string {
  return sample().startedAt
}

describe('sessionFileName time zone', () => {
  it('uses the recorded local time, not the viewer time zone', () => {
    const s = { ...sample(), startedAt: '2026-09-27T23:45:00-05:00' }
    expect(sessionFileName(s)).toBe('amsler-left-red-20260927-2345.json')
  })
})
