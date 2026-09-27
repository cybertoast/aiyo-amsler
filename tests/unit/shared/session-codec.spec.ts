import { describe, expect, it } from 'vitest'
import {
  PAYLOAD_PARAM,
  decodePayload,
  encodePayload,
  payloadFromHash,
  shareUrl,
} from '../../../src/shared/lib/session-codec'

describe('session codec', () => {
  it('round-trips a JSON value', async () => {
    const value = { v: 1, name: 'test ü ✓', responses: 'c'.repeat(400) }
    const payload = await encodePayload(value)
    expect(payload).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(await decodePayload(payload)).toEqual(value)
  })

  it('compresses repetitive data', async () => {
    const payload = await encodePayload({ responses: '.'.repeat(400) })
    expect(payload.length).toBeLessThan(100)
  })

  it('rejects invalid base64url', async () => {
    await expect(decodePayload('not valid!')).rejects.toThrow(/link/i)
  })

  it('rejects data that is not compressed JSON', async () => {
    await expect(decodePayload('AAAA')).rejects.toThrow(/link/i)
  })

  it('builds and parses share URLs with the payload in the fragment', async () => {
    const payload = await encodePayload({ a: 1 })
    const url = shareUrl('https://fit-eyes.nowpresent.co', '/amsler/review', payload)
    expect(url).toBe(`https://fit-eyes.nowpresent.co/amsler/review#${PAYLOAD_PARAM}=${payload}`)
    expect(payloadFromHash(new URL(url).hash)).toBe(payload)
    expect(payloadFromHash('')).toBeNull()
    expect(payloadFromHash('#other=1')).toBeNull()
  })
})
