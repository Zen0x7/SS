import { b64, unb64 } from '~/utils/pki'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export type ProfilePayload = { v: 1; t: 'p'; n: string; i: string; c: string }
export type MessagePayload = { v: 1; alg: string; kid: string; from: string; fid?: string; ts: number; ek: string; iv: string; ct: string }


export const b64u = (bytes: Uint8Array): string =>
  b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export const unb64u = (text: string): Uint8Array =>
  unb64(text.replace(/-/g, '+').replace(/_/g, '/'))

const canZip = () => typeof CompressionStream !== 'undefined'

async function squeeze(bytes: Uint8Array): Promise<Uint8Array> {
  if (!canZip()) return bytes
  const stream = new CompressionStream('deflate-raw')
  const writer = stream.writable.getWriter()
  void writer.write(bytes as BufferSource)
  void writer.close()
  return new Uint8Array(await new Response(stream.readable).arrayBuffer())
}

async function expand(bytes: Uint8Array): Promise<Uint8Array> {
  if (!canZip()) return bytes
  const stream = new DecompressionStream('deflate-raw')
  const writer = stream.writable.getWriter()
  void writer.write(bytes as BufferSource)
  void writer.close()
  return new Uint8Array(await new Response(stream.readable).arrayBuffer())
}

export async function pack(payload: object): Promise<string> {
  const zipped = canZip()
  return (zipped ? '1' : '0') + b64u(await squeeze(encoder.encode(JSON.stringify(payload))))
}

export async function unpack<T>(data: string): Promise<T> {
  const flag = data[0]
  const bytes = unb64u(data.slice(1))
  const raw = flag === '1' ? await expand(bytes) : bytes
  return JSON.parse(decoder.decode(raw)) as T
}

const here = () => location.origin

export const profileLink = async (payload: ProfilePayload) => `${here()}/p/${await pack(payload)}`
export const messageLink = async (payload: MessagePayload) => `${here()}/m/${await pack(payload)}`
