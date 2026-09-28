import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class FakeUtterance {
  rate = 1
  constructor(public text: string) {}
}

describe('useSpeech', () => {
  const speak = vi.fn()
  const cancel = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    speak.mockClear()
    cancel.mockClear()
    vi.stubGlobal('speechSynthesis', { speak, cancel })
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('speaks only when enabled, cancelling earlier speech', async () => {
    const { useSpeech } = await import('../../../src/shared/composables/useSpeech')
    const speech = useSpeech()
    expect(speech.supported).toBe(true)
    speech.say('hello')
    expect(speak).not.toHaveBeenCalled()
    speech.enabled.value = true
    speech.say('hello')
    expect(cancel).toHaveBeenCalled()
    expect(speak.mock.calls[0]![0].text).toBe('hello')
  })

  it('reports unsupported browsers and never speaks', async () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { useSpeech } = await import('../../../src/shared/composables/useSpeech')
    const speech = useSpeech()
    speech.enabled.value = true
    speech.say('hello')
    expect(speech.supported).toBe(false)
    expect(speak).not.toHaveBeenCalled()
  })
})
