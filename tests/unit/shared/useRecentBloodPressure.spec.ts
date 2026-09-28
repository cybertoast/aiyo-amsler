import { beforeEach, describe, expect, it } from 'vitest'
import { useRecentBloodPressure } from '../../../src/shared/composables/useRecentBloodPressure'

const reading = { systolic: 128, diastolic: 82, pulse: 70, takenAt: '2026-09-27T09:25:00+04:00' }

describe('useRecentBloodPressure', () => {
  beforeEach(() => localStorage.clear())

  it('returns a reading saved within the window', () => {
    const recent = useRecentBloodPressure()
    const now = new Date('2026-09-27T10:00:00+04:00')
    recent.remember(reading, now)
    expect(recent.recent(new Date(now.getTime() + 59 * 60_000))).toEqual(reading)
  })

  it('ignores a reading older than 60 minutes', () => {
    const recent = useRecentBloodPressure()
    const now = new Date('2026-09-27T10:00:00+04:00')
    recent.remember(reading, now)
    expect(recent.recent(new Date(now.getTime() + 61 * 60_000))).toBeNull()
  })

  it('ignores corrupt stored data', () => {
    localStorage.setItem('fit-eyes.recentBloodPressure', '"x"')
    expect(useRecentBloodPressure().recent(new Date())).toBeNull()
  })
})
