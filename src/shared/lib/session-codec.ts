/**
 * Encodes session data for share links: base64url(deflate-raw(UTF-8(JSON))).
 * The payload goes in the URL fragment, which browsers never send to the server.
 */

export const PAYLOAD_PARAM = 's'

const INVALID_LINK = 'This link does not contain valid session data.'

async function transform(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const source = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
  const reader = source.pipeThrough(stream).getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    length += value.length
  }
  const out = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) throw new Error(INVALID_LINK)
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

export async function encodePayload(value: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(value))
  return toBase64Url(await transform(json, new CompressionStream('deflate-raw')))
}

/** Returns the parsed JSON value. Throws with a user-readable message on any failure. */
export async function decodePayload(payload: string): Promise<unknown> {
  try {
    const bytes = await transform(fromBase64Url(payload), new DecompressionStream('deflate-raw'))
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  } catch {
    throw new Error(INVALID_LINK)
  }
}

export function shareUrl(origin: string, path: string, payload: string): string {
  return `${origin}${path}#${PAYLOAD_PARAM}=${payload}`
}

export function payloadFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  return params.get(PAYLOAD_PARAM)
}
