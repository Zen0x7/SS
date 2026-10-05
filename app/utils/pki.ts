// SPDX-License-Identifier: AGPL-3.0-only
export const OID = {
  rsaEncryption: '1.2.840.113549.1.1.1',
  sha256WithRSA: '1.2.840.113549.1.1.11',
  commonName: '2.5.4.3',
  organizationName: '2.5.4.10',
  basicConstraints: '2.5.29.19',
  keyUsage: '2.5.29.15',
  extKeyUsage: '2.5.29.37',
  subjectKeyIdentifier: '2.5.29.14',
  serverAuth: '1.3.6.1.5.5.7.3.1'
}

const RSA_ALG = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
const OAEP_ALG: RsaHashedImportParams = { name: 'RSA-OAEP', hash: 'SHA-256' }

export type Identity = {
  id: string
  name: string
  spkiPem: string
  certPem: string
  privPem: string
  created: number
  days: number
}

export type Contact = {
  id: string
  name: string
  spkiPem: string
  added: number
}

export type Envelope = {
  v: 1
  alg: string
  kid: string
  from: string
  fid?: string
  ts: number
  ek: string
  iv: string
  ct: string
}

/* ---------- base64 / PEM ---------- */

export function b64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin)
}

export function unb64(text: string): Uint8Array {
  const clean = text.replace(/\s+/g, '')
  const bin = atob(clean)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export function toPem(label: string, bytes: Uint8Array): string {
  const body = b64(bytes).replace(/(.{64})/g, '$1\n').replace(/\n$/, '')
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`
}

export function readPem(text: string, labels: string[]): { label: string; der: Uint8Array } {
  const re = new RegExp(`-----BEGIN (${labels.join('|')})-----([\\s\\S]*?)-----END \\1-----`)
  const match = text.match(re)
  if (!match) throw new Error(`No encontré un bloque PEM de tipo: ${labels.join(' / ')}`)
  return { label: match[1]!, der: unb64(match[2]!) }
}

/* ---------- ASN.1 / DER ---------- */

const enc = new TextEncoder()

function derLen(n: number): number[] {
  if (n < 0x80) return [n]
  const bytes: number[] = []
  let x = n
  while (x > 0) {
    bytes.unshift(x & 0xff)
    x = Math.floor(x / 256)
  }
  return [0x80 | bytes.length, ...bytes]
}

function tlv(tag: number, content: number[]): number[] {
  return [tag, ...derLen(content.length), ...content]
}

const cat = (...parts: number[][]): number[] => parts.flat()
const seq = (...parts: number[][]): number[] => tlv(0x30, cat(...parts))
const set = (...parts: number[][]): number[] => tlv(0x31, cat(...parts))
const octet = (content: number[]): number[] => tlv(0x04, content)
const bool = (v: boolean): number[] => tlv(0x01, [v ? 0xff : 0x00])

function intNum(value: number): number[] {
  const bytes: number[] = []
  let x = value
  do {
    bytes.unshift(x & 0xff)
    x = Math.floor(x / 256)
  } while (x > 0)
  if (bytes[0]! & 0x80) bytes.unshift(0x00)
  return tlv(0x02, bytes)
}

function intBytes(bytes: Uint8Array): number[] {
  let start = 0
  while (start < bytes.length - 1 && bytes[start] === 0) start++
  let body = Array.from(bytes.slice(start))
  if (body[0]! & 0x80) body.unshift(0x00)
  return tlv(0x02, body)
}

function oid(dotted: string): number[] {
  const parts = dotted.split('.').map(Number)
  const body: number[] = [parts[0]! * 40 + parts[1]!]
  for (const part of parts.slice(2)) {
    const chunk: number[] = [part & 0x7f]
    let rest = Math.floor(part / 128)
    while (rest > 0) {
      chunk.unshift((rest & 0x7f) | 0x80)
      rest = Math.floor(rest / 128)
    }
    body.push(...chunk)
  }
  return tlv(0x06, body)
}

function utf8(text: string): number[] {
  return tlv(0x0c, Array.from(enc.encode(text)))
}

function utcTime(date: Date): number[] {
  const p = (n: number) => String(n).padStart(2, '0')
  const s = `${p(date.getUTCFullYear() % 100)}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`
  return tlv(0x17, Array.from(enc.encode(s)))
}

function x509Name(cn: string): number[] {
  return seq(
    set(seq(oid(OID.commonName), utf8(cn))),
    set(seq(oid(OID.organizationName), utf8('SS PWA')))
  )
}

function parseLen(der: Uint8Array, at: number): { len: number; total: number } {
  let len = der[at]!
  let total = at + 1
  if (len & 0x80) {
    const count = len & 0x7f
    len = 0
    for (let k = 0; k < count; k++) {
      len = len * 256 + der[total++]!
    }
  }
  return { len, total }
}

/* ---------- X.509 ---------- */

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', data as BufferSource))
}

export async function selfSignCertificate(cn: string, spki: Uint8Array, priv: CryptoKey, days: number): Promise<{ pem: string; serial: string; notAfter: string }> {
  const now = Date.now()
  const notBefore = new Date(now - 86400000)
  const notAfter = new Date(now + days * 86400000)
  const serialBytes = crypto.getRandomValues(new Uint8Array(16))
  serialBytes[0] = serialBytes[0]! & 0x7f
  const serialHex = Array.from(serialBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()

  const algId = seq(oid(OID.sha256WithRSA), tlv(0x05, []))
  const name = x509Name(cn)
  const skid = (await sha256(spki)).slice(0, 20)

  const extensions = seq(
    seq(oid(OID.basicConstraints), bool(true), octet(seq(bool(true)))),
    seq(oid(OID.keyUsage), bool(true), octet(tlv(0x03, [5, 0xa0]))),
    seq(oid(OID.extKeyUsage), octet(seq(oid(OID.serverAuth)))),
    seq(oid(OID.subjectKeyIdentifier), octet(octet(Array.from(skid))))
  )

  const tbs = seq(
    tlv(0xa0, intNum(2)),
    intBytes(serialBytes),
    algId,
    name,
    seq(utcTime(notBefore), utcTime(notAfter)),
    name,
    Array.from(spki),
    tlv(0xa3, extensions)
  )

  const signature = new Uint8Array(await crypto.subtle.sign(RSA_ALG, priv, Uint8Array.from(tbs)))
  const cert = seq(tbs, algId, tlv(0x03, [0, ...signature]))
  return { pem: toPem('CERTIFICATE', Uint8Array.from(cert)), serial: serialHex, notAfter: notAfter.toISOString() }
}

/** Extrae el SubjectPublicKeyInfo de un PEM tipo CERTIFICATE. */
export function spkiFromCertificatePem(certPem: string): Uint8Array {
  const { der } = readPem(certPem, ['CERTIFICATE', 'X509 CERTIFICATE', 'TRUSTED CERTIFICATE'])
  // Certificate ::= SEQ { tbsCertificate SEQ {...}, ... }
  const certLen = parseLen(der, 1)
  let i = certLen.total
  const tag = der[i]!
  if (tag !== 0x30) throw new Error('Certificado X.509 inválido')
  const tbsLen = parseLen(der, i + 1)
  const tbsChildren = splitSeq(der.slice(i, tbsLen.total + tbsLen.len))
  const version = tbsChildren[0]![0] === 0xa0
  const spkiIndex = version ? 6 : 5
  const spki = tbsChildren[spkiIndex]
  if (!spki || spki[0] !== 0x30) throw new Error('No encontré la clave pública dentro del certificado')
  return spki
}

function splitSeq(der: Uint8Array): Uint8Array[] {
  const { len, total } = parseLen(der, 1)
  const end = total + len
  const out: Uint8Array[] = []
  let i = total
  while (i < end) {
    const start = i
    i += 1
    const l = parseLen(der, i)
    i = l.total + l.len
    out.push(der.slice(start, i))
  }
  return out
}

function tlvContent(tlv: Uint8Array): Uint8Array {
  const { len, total } = parseLen(tlv, 1)
  return tlv.slice(total, total + len)
}

function splitTlv(content: Uint8Array): Uint8Array[] {
  const out: Uint8Array[] = []
  let i = 0
  while (i < content.length) {
    const start = i
    i += 1
    const info = parseLen(content, i)
    i = info.total + info.len
    out.push(content.slice(start, i))
  }
  return out
}

function rsaSpkiFrom(n: Uint8Array, e: Uint8Array): Uint8Array {
  const algId = seq(oid(OID.rsaEncryption), tlv(0x05, []))
  const pubKey = tlv(0x30, cat(Array.from(n), Array.from(e)))
  return Uint8Array.from(seq(algId, tlv(0x03, [0, ...pubKey])))
}

/** Deriva el SubjectPublicKeyInfo desde una clave privada PKCS#8 o PKCS#1. */
export function spkiFromPrivateDer(der: Uint8Array): Uint8Array {
  const outer = splitTlv(tlvContent(der))
  const isPkcs8 = outer[2]?.[0] === 0x04 && outer[1]?.[0] === 0x30
  const pkcs1 = isPkcs8 ? splitTlv(tlvContent(tlvContent(outer[2]!))) : outer
  if (pkcs1[1]?.[0] !== 0x02 || pkcs1[2]?.[0] !== 0x02) throw new Error('La clave privada no es RSA')
  return rsaSpkiFrom(pkcs1[1]!, pkcs1[2]!)
}

/** Convierte PKCS#1 (RSA PRIVATE KEY) a PKCS#8 para poder importarla. */
function pkcs1ToPkcs8(pkcs1: Uint8Array): Uint8Array {
  const algId = seq(oid(OID.rsaEncryption), tlv(0x05, []))
  return Uint8Array.from(seq(intNum(0), algId, octet(Array.from(pkcs1))))
}

/* ---------- claves ---------- */

export async function keyId(spki: Uint8Array): Promise<string> {
  const hash = await sha256(spki)
  return Array.from(hash.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

export async function importPublicKey(spki: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey('spki', spki as BufferSource, OAEP_ALG, true, ['encrypt'])
}

export type PrivateKey = { key: CryptoKey; signer: CryptoKey; id: string; spki: Uint8Array; spkiPem: string }

export async function importPrivateKey(privPem: string): Promise<PrivateKey> {
  const { label, der } = readPem(privPem, ['PRIVATE KEY', 'RSA PRIVATE KEY'])
  const pkcs8 = label === 'RSA PRIVATE KEY' ? pkcs1ToPkcs8(der) : der
  const key = await crypto.subtle.importKey('pkcs8', pkcs8 as BufferSource, OAEP_ALG, true, ['decrypt'])
  const signer = await crypto.subtle.importKey('pkcs8', pkcs8 as BufferSource, RSA_ALG, true, ['sign'])
  const spki = spkiFromPrivateDer(der)
  return { key, signer, id: await keyId(spki), spki, spkiPem: toPem('PUBLIC KEY', spki) }
}

export async function generateIdentity(name: string, days = 3650): Promise<Identity> {
  const pair = (await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  )) as CryptoKeyPair
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', pair.publicKey))
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey))
  const cert = await selfSignCertificate(name, spki, pair.privateKey, days)
  return {
    id: await keyId(spki),
    name,
    spkiPem: toPem('PUBLIC KEY', spki),
    certPem: cert.pem,
    privPem: toPem('PRIVATE KEY', pkcs8),
    created: Date.now(),
    days
  }
}

/** Normaliza un SPKI (DER) y comprueba que sea una clave RSA usable. */
export async function normalizePublicDer(spki: Uint8Array): Promise<{ id: string; spkiPem: string }> {
  if (spki[0] !== 0x30) throw new Error('El enlace no contiene una clave pública válida')
  const id = await keyId(spki)
  await importPublicKey(spki)
  return { id, spkiPem: toPem('PUBLIC KEY', spki) }
}

/** Acepta CERTIFICATE o PUBLIC KEY en PEM y devuelve el SPKI normalizado. */
export async function normalizePublicPem(pem: string): Promise<{ id: string; spkiPem: string }> {
  const trimmed = pem.trim()
  if (trimmed.includes('CERTIFICATE')) return normalizePublicDer(spkiFromCertificatePem(trimmed))
  return normalizePublicDer(readPem(trimmed, ['PUBLIC KEY']).der)
}

/** Reconstruye un perfil (público) a partir de una clave privada existente. */
export async function identityFromPrivate(privPem: string, name: string, days = 3650): Promise<Identity> {
  const { signer, id, spki, spkiPem } = await importPrivateKey(privPem)
  const cert = await selfSignCertificate(name, spki, signer, days)
  return { id, name, spkiPem, certPem: cert.pem, privPem, created: Date.now(), days }
}

/* ---------- sobre de cifrado ---------- */

export async function encryptMessage(text: string, to: Contact, from: string, fromId?: string): Promise<Envelope> {
  const spki = readPem(to.spkiPem, ['PUBLIC KEY']).der
  const pub = await importPublicKey(spki)
  const raw = crypto.getRandomValues(new Uint8Array(32))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const aesKey = await crypto.subtle.importKey('raw', raw as BufferSource, 'AES-GCM', false, ['encrypt'])
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, aesKey, new TextEncoder().encode(text) as BufferSource))
  const wrapped = new Uint8Array(await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pub, raw as BufferSource))
  return {
    v: 1,
    alg: 'RSA-OAEP-256+AES-256-GCM',
    kid: to.id,
    from,
    fid: fromId,
    ts: Date.now(),
    ek: b64(wrapped),
    iv: b64(iv),
    ct: b64(ct)
  }
}

export type Opened = { text: string; from: string; fid?: string; ts: number; kid: string }

export async function decryptEnvelope(envelope: Envelope, keys: CryptoKey[]): Promise<Opened> {
  if (envelope?.v !== 1 || !envelope.ek || !envelope.iv || !envelope.ct) {
    throw new Error('El sobre no tiene el formato esperado')
  }
  let lastError: unknown
  for (const key of keys) {
    try {
      const raw = new Uint8Array(await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, unb64(envelope.ek) as BufferSource))
      const aesKey = await crypto.subtle.importKey('raw', raw as BufferSource, 'AES-GCM', false, ['decrypt'])
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(envelope.iv) as BufferSource }, aesKey, unb64(envelope.ct) as BufferSource)
      return { text: new TextDecoder().decode(plain), from: envelope.from || 'desconocido', fid: envelope.fid, ts: envelope.ts || 0, kid: envelope.kid }
    } catch (error) {
      lastError = error
    }
  }
  throw new Error(`No pude descifrarlo. ¿Cargaste la clave privada correcta? ${(lastError as Error)?.message ?? ''}`)
}

export async function fingerprint(pem: string): Promise<string> {
  const { der } = readPem(pem, ['CERTIFICATE', 'PUBLIC KEY'])
  const hash = await sha256(der)
  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase().replace(/(.{2})/g, '$1:').replace(/:$/, '')
}