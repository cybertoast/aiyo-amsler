import { describe, expect, it } from 'vitest'
import { useAmslerTest } from '../../../../src/experiences/amsler/composables/useAmslerTest'
import type { SessionSettings } from '../../../../src/experiences/amsler/lib/session-schema'

const settings: SessionSettings = {
  eye: 'right',
  color: 'mono',
  theme: 'light',
  displayMode: 'label',
  order: 'sequential',
  scope: { type: 'region', region: 'NW' },
}

describe('useAmslerTest', () => {
  it('walks the sequence, records responses, and completes', () => {
    const test = useAmslerTest()
    test.start(settings, 'my session')
    expect(test.session.value?.name).toBe('my session')
    expect(test.total.value).toBe(100)
    expect(test.currentCell.value).toBe(0)
    test.respond('clear')
    expect(test.currentCell.value).toBe(1)
    test.respond('blurry')
    expect(test.position.value).toBe(2)
    expect(test.session.value?.responses.slice(0, 2)).toBe('cb')
    for (let i = 2; i < 100; i++) test.respond('invisible')
    expect(test.finished.value).toBe(true)
    expect(test.currentCell.value).toBeNull()
    expect(test.session.value?.completedAt).toBeDefined()
    test.respond('clear')
    expect(test.position.value).toBe(100)
  })

  it('back clears the previous response', () => {
    const test = useAmslerTest()
    test.start(settings)
    test.respond('clear')
    test.respond('blurry')
    test.back()
    expect(test.position.value).toBe(1)
    expect(test.session.value?.responses[1]).toBe('.')
    test.back()
    test.back()
    expect(test.position.value).toBe(0)
  })

  it('ignores responses while paused', () => {
    const test = useAmslerTest()
    test.start(settings)
    test.pause()
    test.respond('clear')
    expect(test.position.value).toBe(0)
    test.resume()
    test.respond('clear')
    expect(test.position.value).toBe(1)
  })

  it('generates a seed when random order is chosen and uses the default name when blank', () => {
    const test = useAmslerTest()
    test.start({ ...settings, order: 'random' }, '   ')
    expect(typeof test.session.value?.seed).toBe('number')
    expect(test.session.value?.name).toMatch(/^right-mono-\d{4}-\d{2}-\d{2}-\d{4}$/)
  })
  it('stores an optional blood pressure reading in the session', () => {
    const test = useAmslerTest()
    const bp = { systolic: 120, diastolic: 80, takenAt: '2026-09-27T09:00:00+04:00' }
    test.start(settings, '', bp)
    expect(test.session.value?.bloodPressure).toEqual(bp)
  })
})
