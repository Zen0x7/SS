import type { Contact, Identity } from '~/utils/pki'
import { generateIdentity, identityFromPrivate, importPrivateKey, normalizePublicDer, readPem } from '~/utils/pki'
import { b64u, unb64u } from '~/utils/share'

const K_IDENTITY = 'ss.identity.v1'
const K_PRIVATE = 'ss.private.v1'
const K_CONTACTS = 'ss.contacts.v1'

export type PublicIdentity = Pick<Identity, 'id' | 'name' | 'spkiPem' | 'certPem' | 'created' | 'days'>

const keyCache = new Map<string, CryptoKey>()

export const useVault = () => {
  const identity = useState<PublicIdentity | null>('ss:identity', () => null)
  const contacts = useState<Contact[]>('ss:contacts', () => [])
  const privPems = useState<Record<string, string>>('ss:priv', () => ({}))
  const ready = useState('ss:ready', () => false)
  const notice = useState<{ text: string; kind: 'ok' | 'error' } | null>('ss:notice', () => null)

  const flash = (text: string, kind: 'ok' | 'error' = 'ok') => {
    notice.value = { text, kind }
    if (import.meta.client) window.setTimeout(() => (notice.value = null), 7000)
  }

  const persist = () => {
    if (!import.meta.client) return
    localStorage.setItem(K_IDENTITY, JSON.stringify(identity.value))
    localStorage.setItem(K_CONTACTS, JSON.stringify(contacts.value))
    localStorage.setItem(K_PRIVATE, JSON.stringify(privPems.value))
  }

  const init = () => {
    if (!import.meta.client || ready.value) return
    try {
      identity.value = JSON.parse(localStorage.getItem(K_IDENTITY) || 'null')
      contacts.value = JSON.parse(localStorage.getItem(K_CONTACTS) || '[]')
      privPems.value = JSON.parse(localStorage.getItem(K_PRIVATE) || '{}')
    } catch {
      flash('No pude leer lo que había guardado en este navegador', 'error')
    }
    ready.value = true
  }

  const forgetAll = () => {
    identity.value = null
    contacts.value = []
    privPems.value = {}
    keyCache.clear()
    persist()
  }

  /** Crea el perfil: llave nueva + certificado autofirmado. Todo automático. */
  const create = async (name: string, days = 3650) => {
    const full = await generateIdentity(name.trim() || 'anónimo', days)
    const { privPem, ...pub } = full
    privPems.value = { ...privPems.value, [full.id]: privPem }
    identity.value = pub
    keyCache.set(full.id, (await importPrivateKey(privPem)).key)
    persist()
    return full
  }

  const keys = async (): Promise<CryptoKey[]> => {
    const out: CryptoKey[] = []
    for (const [id, pem] of Object.entries(privPems.value)) {
      if (!pem) continue
      if (!keyCache.has(id)) {
        try {
          keyCache.set(id, (await importPrivateKey(pem)).key)
        } catch {
          /* llave ilegible: se ignora */
        }
      }
      const key = keyCache.get(id)
      if (key) out.push(key)
    }
    return out
  }

  /** Contacto a partir de un enlace de perfil (nombre + clave pública en base64url). */
  const addContactShare = async (name: string, publicKey: string) => {
    const { id, spkiPem } = await normalizePublicDer(unb64u(publicKey))
    const contact: Contact = { id, name: name.trim() || 'contacto', spkiPem, added: Date.now() }
    contacts.value = [...contacts.value.filter(c => c.id !== id), contact]
    persist()
    return contact
  }

  const removeContact = (id: string) => {
    contacts.value = contacts.value.filter(c => c.id !== id)
    persist()
  }

  /** Datos del perfil para compartir por enlace. */
  const shareProfile = () => {
    if (!identity.value) throw new Error('Primero crea tu perfil')
    const spki = readPem(identity.value.spkiPem, ['PUBLIC KEY']).der
    return { v: 1 as const, t: 'p' as const, n: identity.value.name, i: identity.value.id, c: b64u(spki) }
  }

  /** Respaldo descargable: perfil completo, con todos los contactos. */
  const profileBackup = () => {
    if (!identity.value) throw new Error('Primero crea tu perfil')
    return {
      app: 'SS',
      v: 1,
      name: identity.value.name,
      id: identity.value.id,
      created: identity.value.created,
      certificate: identity.value.certPem,
      publicKey: identity.value.spkiPem,
      privateKey: privPems.value[identity.value.id] || '',
      contacts: contacts.value
    }
  }

  /** Restaura el perfil (y sus contactos) desde el respaldo. */
  const importProfile = async (raw: string) => {
    let data
    try {
      data = JSON.parse(raw)
    } catch {
      throw new Error('Ese archivo no es un perfil de SS')
    }
    if (!data?.privateKey || typeof data.privateKey !== 'string') throw new Error('Al archivo le falta la llave del perfil')

    const imported = await importPrivateKey(data.privateKey)
    const id = imported.id
    const name = String(data.name || 'anónimo').trim() || 'anónimo'
    const restored = data.certificate ? null : await identityFromPrivate(data.privateKey, name)
    const certPem = data.certificate || restored!.certPem
    const spkiPem = data.publicKey || imported.spkiPem

    keyCache.clear()
    privPems.value = { [id]: data.privateKey }
    identity.value = {
      id,
      name,
      spkiPem,
      certPem,
      created: Number(data.created) || Date.now(),
      days: 3650
    }
    contacts.value = Array.isArray(data.contacts)
      ? data.contacts
          .filter((c: Contact) => c && typeof c.name === 'string' && typeof c.spkiPem === 'string' && typeof c.id === 'string')
          .map((c: Contact) => ({ id: c.id, name: c.name, spkiPem: c.spkiPem, added: Number(c.added) || Date.now() }))
      : []
    keyCache.set(id, imported.key)
    persist()
    return { name, contacts: contacts.value.length }
  }

  const hasKeys = computed(() => Object.values(privPems.value).some(Boolean))
  const privPemOf = (id: string) => privPems.value[id] || ''

  return {
    identity,
    contacts,
    privPems,
    ready,
    notice,
    hasKeys,
    init,
    persist,
    forgetAll,
    create,
    keys,
    addContactShare,
    removeContact,
    shareProfile,
    profileBackup,
    importProfile,
    privPemOf,
    flash
  }
}

/** Copia al portapapeles con respaldo para contextos sin API de clipboard. */
export const copyText = async (text: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    /* probamos el respaldo */
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  area.remove()
}

export const readFile = (file: File) => file.text()

export const download = (filename: string, content: string, mime = 'application/octet-stream') => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}