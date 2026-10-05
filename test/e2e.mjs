// E2E: bienvenida, enlaces por portapapeles, contactos, mensajes, i18n, respaldo y PWA.
// Uso: yarn build && yarn test:e2e
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const PORT = Number(process.env.PORT || 3200 + Math.floor(Math.random() * 300))
const BASE = `http://127.0.0.1:${PORT}/`
const ROOT = new URL('..', import.meta.url).pathname
const CACHE = `${ROOT}node_modules/.cache/e2e`
mkdirSync(CACHE, { recursive: true })

const server = spawn('node', ['.output/server/index.mjs'], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' },
  stdio: 'ignore'
})
await new Promise(r => setTimeout(r, 2000))

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  args: ['--no-sandbox']
})

let failures = 0
const check = (label, ok) => {
  console.log(`${ok ? 'OK   ' : 'FALLA'} ${label}`)
  if (!ok) failures++
}

const open = async (label, url = BASE) => {
  const ctx = await browser.newContext()
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE })
  const page = await ctx.newPage()
  page.setDefaultTimeout(15000)
  page.on('pageerror', e => console.log(`  [${label}] pageerror:`, e.message))
  await page.addInitScript(() => {
    try {
      localStorage.setItem('ss.locale', 'es')
    } catch {}
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  return { ctx, page }
}

const store = page =>
  page.evaluate(() => ({
    identity: JSON.parse(localStorage.getItem('ss.identity.v1') || 'null'),
    priv: JSON.parse(localStorage.getItem('ss.private.v1') || '{}'),
    contacts: JSON.parse(localStorage.getItem('ss.contacts.v1') || '[]')
  }))

const copyFrom = async (page, label, copied) => {
  await page.locator(`button:has-text("${label}")`).click()
  await page.waitForSelector(`button:has-text("${copied}")`)
  await page.waitForTimeout(120)
  return (await page.evaluate(() => navigator.clipboard.readText())).trim()
}

const signup = async (label, name) => {
  const p = await open(label)
  await p.page.fill('input[placeholder="escribe tu nombre"]', name)
  await p.page.click('button:has-text("Empezar")')
  await p.page.waitForSelector('button:has-text("Copiar enlace de perfil")')
  const link = await copyFrom(p.page, 'Copiar enlace de perfil', 'Enlace copiado')
  const s = await store(p.page)
  check(`${name}: perfil y enlace listos`, link.startsWith(`${BASE}p/`) && Boolean(s.identity))
  check(`${name}: llave guardada en el dispositivo`, Object.values(s.priv)[0]?.includes('PRIVATE'))
  return { ...p, link, id: s.identity.id }
}

// ---------------------------------------------------------------- bienvenida
const A = await open('alice')
check('la bienvenida no muestra URLs ni inputs de contacto', (await A.page.locator('.linkbox, textarea').count()) === 0)
await A.page.fill('input[placeholder="escribe tu nombre"]', 'alice')
await A.page.click('button:has-text("Empezar")')
await A.page.waitForSelector('button:has-text("Copiar enlace de perfil")')
check('el nombre aparece en el saludo', (await A.page.textContent('h1')).includes('alice'))
const linkA = await copyFrom(A.page, 'Copiar enlace de perfil', 'Enlace copiado')

const B = await signup('bob', 'bob')
check('ids distintos', (await store(A.page)).identity.id !== (await store(B.page)).identity.id)

// ---------------------------------------------------------------- contacto por enlace
await A.page.goto(B.link, { waitUntil: 'networkidle' })
await A.page.waitForSelector('.row', { timeout: 5000 })
check('A agrega a B abriendo el enlace', (await store(A.page)).contacts.some(c => c.name === 'bob'))

// ---------------------------------------------------------------- mensaje
await A.page.click('.row button:has-text("Escribir")')
await A.page.waitForURL(/\/escribir\//)
await A.page.waitForSelector('textarea')
await A.page.fill('textarea', 'mensaje secreto 123 ñ 🔐')
const msgLink = await copyFrom(A.page, 'Copiar enlace del mensaje', 'Enlace copiado')
check('el enlace del mensaje es /m/', msgLink.includes('/m/'))
check('el enlace no contiene el texto plano', !msgLink.includes('mensaje secreto'))

await B.page.goto(msgLink, { waitUntil: 'networkidle' })
await B.page.waitForURL(/\/mensaje/)
await B.page.waitForSelector('.message__text')
check('B lee el mensaje', (await B.page.textContent('.message__text')).includes('mensaje secreto 123 ñ 🔐'))
check('B ve de quién es', (await B.page.textContent('h1')).includes('alice'))

// ---------------------------------------------------------------- otro dispositivo no puede
const C = await signup('carol', 'carol')
await C.page.goto(msgLink, { waitUntil: 'networkidle' })
await C.page.waitForSelector('.toast--error')
check('carol no puede descifrar', (await C.page.textContent('.toast--error')).includes('no es para este dispositivo'))

// ---------------------------------------------------------------- i18n
await A.page.click('.lang__btn')
await A.page.click('.lang__opt:has-text("English")')
await A.page.waitForSelector('button:has-text("Copy profile link")')
check('cambia a inglés', (await A.page.textContent('nav')).includes('Contacts'))
await A.page.click('.lang__btn')
await A.page.click('.lang__opt:has-text("Español")')
await A.page.waitForSelector('button:has-text("Copiar enlace de perfil")')
check('vuelve a español', (await A.page.textContent('nav')).includes('Perfil'))

// ---------------------------------------------------------------- responder
await B.page.goto(linkA, { waitUntil: 'networkidle' })
await B.page.waitForSelector('.row')
await B.page.goto(msgLink, { waitUntil: 'networkidle' })
await B.page.waitForSelector('.message__text')
await B.page.click('button:has-text("Responder")')
await B.page.waitForURL(/\/escribir\//)
await B.page.fill('textarea', 'recibido, te paso la clave')
const replyLink = await copyFrom(B.page, 'Copiar enlace del mensaje', 'Enlace copiado')
await A.page.goto(replyLink, { waitUntil: 'networkidle' })
await A.page.waitForSelector('.message__text')
check('A lee la respuesta', (await A.page.textContent('.message__text')).includes('recibido, te paso la clave'))

// ---------------------------------------------------------------- respaldo multi-dispositivo
const backup = await A.page.evaluate(() => {
  const identity = JSON.parse(localStorage.getItem('ss.identity.v1'))
  const priv = JSON.parse(localStorage.getItem('ss.private.v1'))
  const contacts = JSON.parse(localStorage.getItem('ss.contacts.v1') || '[]')
  return {
    app: 'SS',
    v: 1,
    name: identity.name,
    id: identity.id,
    created: identity.created,
    certificate: identity.certPem,
    publicKey: identity.spkiPem,
    privateKey: priv[identity.id],
    contacts
  }
})
const backupPath = `${CACHE}/alice-perfil.json`
writeFileSync(backupPath, JSON.stringify(backup, null, 2))
const F = await open('feng')
await F.page.setInputFiles('input[accept=".json,application/json"]', backupPath)
await F.page.waitForSelector('button:has-text("Copiar enlace de perfil")')
const sF = await store(F.page)
check('el respaldo restaura nombre e id', sF.identity?.name === 'alice' && sF.identity?.id === backup.id)
check('el respaldo trae los contactos', sF.contacts.some(c => c.name === 'bob'))
check('el respaldo trae la llave', Object.values(sF.priv)[0]?.includes('PRIVATE'))

// ---------------------------------------------------------------- términos
await A.page.click('nav a:has-text("Términos")')
await A.page.waitForSelector('h1:has-text("Términos de Servicio")')
const terms = await A.page.textContent('main')
check('los términos eximen de responsabilidad', terms.includes('Exención de responsabilidad') && terms.includes('Usos prohibidos'))

// ---------------------------------------------------------------- persistencia
await A.page.goto(BASE, { waitUntil: 'networkidle' })
await A.page.reload({ waitUntil: 'networkidle' })
await A.page.waitForSelector('button:has-text("Copiar enlace de perfil")')
const sA = await store(A.page)
check('al reabrir sigue el perfil', sA.identity?.name === 'alice')
check('al reabrir siguen los contactos', sA.contacts.length >= 1)

// ---------------------------------------------------------------- zona delicada
await A.page.goto(`${BASE}perfil`, { waitUntil: 'networkidle' })
await A.page.click('button:has-text("Borrar todo")')
await A.page.click('button:has-text("Sí, borrar todo")')
await A.page.waitForSelector('input[placeholder="escribe tu nombre"]')
check('borrar todo vuelve a la bienvenida', (await store(A.page)).identity === null)

// ---------------------------------------------------------------- PWA
await B.page.goto(BASE, { waitUntil: 'networkidle' })
check('service worker registrado', await B.page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration())))
check('manifest disponible', await B.page.evaluate(async () => (await fetch('/manifest.webmanifest')).ok))
await B.page.waitForTimeout(1200)
await B.ctx.setOffline(true)
await B.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {})
check('abre sin internet', await B.page.locator('button:has-text("Copiar enlace de perfil")').isVisible().catch(() => false))
await B.ctx.setOffline(false)

await browser.close()
server.kill()
console.log(failures ? `\n${failures} FALLAS` : '\nTodo OK')
process.exit(failures ? 1 : 0)