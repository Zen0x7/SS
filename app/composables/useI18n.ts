export type Locale = 'es' | 'en'

type Dict = Record<string, string>

const messages: Record<Locale, Dict> = {
  es: {
    'brand.tagline': 'Servicio de Secretos',
    'nav.home': 'Inicio',
    'nav.contacts': 'Contactos',
    'nav.profile': 'Perfil',
    'nav.terms': 'Términos',
    'nav.language': 'Idioma',

    'welcome.title': 'Servicio de Secretos',
    'welcome.lead': 'Mensajes que solo puede leer la persona que elijas. Sin cuentas, sin servidores, sin rastros.',
    'welcome.name': 'Tu nombre',
    'welcome.placeholder': 'escribe tu nombre',
    'welcome.start': 'Empezar',
    'welcome.starting': 'Creando tu perfil…',
    'welcome.or': 'o',
    'welcome.import': 'Importar mi perfil (.json)',
    'welcome.importHint': 'Si ya usabas SS en otro dispositivo, sube tu respaldo y vuelves con tus contactos.',
    'welcome.needName': 'Escribe tu nombre para continuar',
    'welcome.terms': 'Al continuar aceptas los Términos de Servicio.',

    'home.timeGreetingM': 'Buenos días, {name}',
    'home.timeGreetingA': 'Buenas tardes, {name}',
    'home.timeGreetingE': 'Buenas noches, {name}',
    'home.lead': 'Comparte tu enlace una sola vez. Quien lo abra queda en tus contactos, sin pedirle nada.',
    'home.copy': 'Copiar enlace de perfil',
    'home.copied': 'Enlace copiado',
    'home.linkHint': 'Mándalo por donde quieras: WhatsApp, correo, mensaje.',
    'home.contacts': 'Contactos',
    'home.contactsEmpty': 'Todavía no tienes contactos.',
    'home.contactsOne': '1 contacto',
    'home.contactsMany': '{n} contactos',
    'home.profile': 'Tu perfil',
    'home.profileLead': 'Respaldo, idioma y ajustes.',
    'home.open': 'Abrir',
    'home.seeAll': 'Ver todos',

    'contacts.title': 'Contactos',
    'contacts.lead': 'Cada persona que abra tu enlace aparece aquí. También aparecen cuando abres el enlace de ellos.',
    'contacts.empty': 'Cuando alguien te pase su enlace de perfil, aparece aquí solo.',
    'contacts.search': 'Buscar',
    'contacts.none': 'Ningún contacto coincide.',
    'contacts.write': 'Escribir',
    'contacts.remove': 'Quitar',
    'contacts.confirm': '¿Seguro?',
    'contacts.yes': 'Sí, quitar',
    'contacts.cancel': 'Cancelar',
    'contacts.added': '{name} está en tus contactos',

    'compose.title': 'Mensaje para {name}',
    'compose.lead': 'Se cifra con la llave de {name}. Ni este dispositivo puede leerlo después.',
    'compose.placeholder': 'escribe tu mensaje…',
    'compose.copy': 'Copiar enlace del mensaje',
    'compose.copied': 'Enlace copiado',
    'compose.sendHint': 'Mándaselo a {name} por donde quieras: solo esa persona puede abrirlo.',
    'compose.needText': 'Escribe un mensaje',
    'compose.back': 'Volver',

    'message.title': 'Mensaje de {name}',
    'message.copy': 'Copiar texto',
    'message.copied': 'Copiado',
    'message.reply': 'Responder',
    'message.footer': 'Este mensaje se abrió en tu dispositivo. No quedó registro en ningún servidor.',
    'message.notForYou': 'Este mensaje no es para este dispositivo',

    'profile.title': 'Tu perfil',
    'profile.lead': 'Esto es lo que la app guarda de ti en este dispositivo.',
    'profile.name': 'Nombre',
    'profile.created': 'Creado',
    'profile.id': 'Identificador',
    'profile.link': 'Enlace de perfil',
    'profile.copy': 'Copiar enlace de perfil',
    'profile.copied': 'Enlace copiado',
    'profile.backup': 'Respaldo',
    'profile.backupLead': 'Incluye tu nombre, tu llave y todos tus contactos. Guárdalo para pasar a otro dispositivo.',
    'profile.download': 'Descargar (.json)',
    'profile.import': 'Importar (.json)',
    'profile.downloaded': 'Respaldo descargado',
    'profile.imported': 'Perfil de {name} restaurado con {n} contactos',
    'profile.importedOne': 'Perfil de {name} restaurado con 1 contacto',
    'profile.language': 'Idioma',
    'profile.danger': 'Zona delicada',
    'profile.dangerLead': 'Borra tu perfil, tu llave y tus contactos de este dispositivo. No se puede deshacer.',
    'profile.reset': 'Borrar todo',
    'profile.resetConfirm': 'Sí, borrar todo',
    'profile.cancel': 'Cancelar',

    'error.link': 'Ese enlace no se pudo leer',
    'error.key': 'No pude leer tu archivo: {message}',
    'error.profileFile': 'Ese archivo no es un perfil de SS',
    'error.noKey': 'Al archivo le falta la llave del perfil',
    'footer.by': 'Creada por',
    'footer.rights': 'Todos los derechos reservados',
    'footer.source': 'Código en GitHub',
    'footer.version': 'Versión {version}',
    'install': 'Instalar',
    'install.title': 'Instalar app',
    'install.lead': 'Ábrela sin navegador, en pantalla completa y sin internet.',
    'install.button': 'Instalar SS',
    'install.done': 'SS ya está instalada en este dispositivo.',
    'install.ios': 'En iPhone o iPad: toca Compartir y elige «Añadir a pantalla de inicio».',
    'install.dismissed': 'Sin problema, puedes instalarla cuando quieras.',
    'install.unsupported': 'Tu navegador no ofrece la instalación automática. Si estás en escritorio, busca el ícono de instalar en la barra de direcciones.',
    'install.hintDesktop': 'Usa el ícono de instalar de la barra de direcciones, o el menú del navegador → «Instalar SS».',
    'install.hintIOS': 'Toca Compartir y elige «Añadir a pantalla de inicio».',
  },
  en: {
    'brand.tagline': 'Secrets Service',
    'nav.home': 'Home',
    'nav.contacts': 'Contacts',
    'nav.profile': 'Profile',
    'nav.terms': 'Terms',
    'nav.language': 'Language',

    'welcome.title': 'Secrets Service',
    'welcome.lead': 'Messages only the person you choose can read. No accounts, no servers, no traces.',
    'welcome.name': 'Your name',
    'welcome.placeholder': 'type your name',
    'welcome.start': 'Get started',
    'welcome.starting': 'Creating your profile…',
    'welcome.or': 'or',
    'welcome.import': 'Import my profile (.json)',
    'welcome.importHint': 'If you already used SS on another device, upload your backup and get your contacts back.',
    'welcome.needName': 'Type your name to continue',
    'welcome.terms': 'By continuing you accept the Terms of Service.',

    'home.timeGreetingM': 'Good morning, {name}',
    'home.timeGreetingA': 'Good afternoon, {name}',
    'home.timeGreetingE': 'Good evening, {name}',
    'home.lead': 'Share your link once. Whoever opens it lands in your contacts, no questions asked.',
    'home.copy': 'Copy profile link',
    'home.copied': 'Link copied',
    'home.linkHint': 'Send it however you like: WhatsApp, email, text.',
    'home.contacts': 'Contacts',
    'home.contactsEmpty': 'No contacts yet.',
    'home.contactsOne': '1 contact',
    'home.contactsMany': '{n} contacts',
    'home.profile': 'Your profile',
    'home.profileLead': 'Backup, language and settings.',
    'home.open': 'Open',
    'home.seeAll': 'See all',

    'contacts.title': 'Contacts',
    'contacts.lead': 'Everyone who opens your link shows up here. They also appear when you open theirs.',
    'contacts.empty': 'When someone sends you their profile link, they show up here on their own.',
    'contacts.search': 'Search',
    'contacts.none': 'No contact matches.',
    'contacts.write': 'Write',
    'contacts.remove': 'Remove',
    'contacts.confirm': 'Sure?',
    'contacts.yes': 'Yes, remove',
    'contacts.cancel': 'Cancel',
    'contacts.added': '{name} is in your contacts',

    'compose.title': 'Message for {name}',
    'compose.lead': 'Encrypted with {name}’s key. Not even this device can read it afterwards.',
    'compose.placeholder': 'write your message…',
    'compose.copy': 'Copy message link',
    'compose.copied': 'Link copied',
    'compose.sendHint': 'Send it to {name} however you like: only they can open it.',
    'compose.needText': 'Write a message',
    'compose.back': 'Back',

    'message.title': 'Message from {name}',
    'message.copy': 'Copy text',
    'message.copied': 'Copied',
    'message.reply': 'Reply',
    'message.footer': 'This message was opened on your device. It left no trace on any server.',
    'message.notForYou': 'This message is not for this device',

    'profile.title': 'Your profile',
    'profile.lead': 'This is what the app keeps about you on this device.',
    'profile.name': 'Name',
    'profile.created': 'Created',
    'profile.id': 'Identifier',
    'profile.link': 'Profile link',
    'profile.copy': 'Copy profile link',
    'profile.copied': 'Link copied',
    'profile.backup': 'Backup',
    'profile.backupLead': 'Includes your name, your key and all your contacts. Keep it to move to another device.',
    'profile.download': 'Download (.json)',
    'profile.import': 'Import (.json)',
    'profile.downloaded': 'Backup downloaded',
    'profile.imported': 'Profile of {name} restored with {n} contacts',
    'profile.importedOne': 'Profile of {name} restored with 1 contact',
    'profile.language': 'Language',
    'profile.danger': 'Danger zone',
    'profile.dangerLead': 'Deletes your profile, your key and your contacts from this device. It cannot be undone.',
    'profile.reset': 'Delete everything',
    'profile.resetConfirm': 'Yes, delete everything',
    'profile.cancel': 'Cancel',

    'error.link': 'That link could not be read',
    'error.key': 'Could not read your file: {message}',
    'error.profileFile': 'That file is not an SS profile',
    'error.noKey': 'The file is missing the profile key',
    'footer.by': 'Created by',
    'footer.rights': 'All rights reserved',
    'footer.source': 'Source on GitHub',
    'footer.version': 'Version {version}',
    'install': 'Install',
    'install.title': 'Install app',
    'install.lead': 'Open it without a browser, full screen, and offline.',
    'install.button': 'Install SS',
    'install.done': 'SS is already installed on this device.',
    'install.ios': 'On iPhone or iPad: tap Share and choose “Add to Home Screen”.',
    'install.dismissed': 'No problem, you can install it whenever you like.',
    'install.unsupported': 'Your browser does not offer automatic installation. On desktop, look for the install icon in the address bar.',
    'install.hintDesktop': 'Use the install icon in the address bar, or the browser menu → “Install SS”.',
    'install.hintIOS': 'Tap Share and choose “Add to Home Screen”.',
  }
}

const detect = (): Locale => {
  if (!import.meta.client) return 'es'
  const saved = localStorage.getItem('ss.locale')
  if (saved === 'es' || saved === 'en') return saved
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es'
}

export const useI18n = () => {
  const locale = useState<Locale>('ss:locale', () => 'es')

  const setLocale = (next: Locale) => {
    locale.value = next
    if (import.meta.client) localStorage.setItem('ss.locale', next)
  }

  const initLocale = () => setLocale(detect())

  const t = (key: string, vars?: Record<string, string | number>) => {
    const raw = messages[locale.value][key] ?? messages.es[key] ?? key
    if (!vars) return raw
    return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
  }

  const date = (value: number) =>
    new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value))

  const greeting = (name: string) => {
    const hour = new Date().getHours()
    const key = hour < 12 ? 'home.timeGreetingM' : hour < 20 ? 'home.timeGreetingA' : 'home.timeGreetingE'
    return t(key, { name })
  }

  return { locale, setLocale, initLocale, t, date, greeting, locales: ['es', 'en'] as Locale[] }
}