type InstallPrompt = { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: window-controls-overlay)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

export const useInstall = () => {
  const deferred = useState<InstallPrompt | null>('ss:installPrompt', () => null)
  const installed = useState('ss:installed', () => false)
  const ready = useState('ss:installReady', () => false)

  /** Escucha beforeinstallprompt / appinstalled, como indica MDN. */
  const initInstall = (onInstalled?: () => void) => {
    if (!import.meta.client || ready.value) return
    installed.value = isStandalone()
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault()
      deferred.value = event as unknown as InstallPrompt
    })
    window.addEventListener('appinstalled', () => {
      deferred.value = null
      installed.value = true
      onInstalled?.()
    })
    ready.value = true
  }

  /** Lanza el prompt nativo y devuelve la decisión del usuario. */
  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const event = deferred.value
    if (!event) return 'unavailable'
    try {
      await event.prompt()
      const choice = await event.userChoice
      deferred.value = null
      if (choice.outcome === 'accepted') installed.value = true
      return choice.outcome
    } catch {
      deferred.value = null
      return 'unavailable'
    }
  }

  const canPrompt = computed(() => Boolean(deferred.value) && !installed.value)
  const ios = computed(() => import.meta.client && isIOS())
  // Sin prompt nativo (iOS, Firefox, o ya instalada): mostramos instrucciones.
  const showIOSHint = computed(() => ios.value && !installed.value && !deferred.value)
  const hintKey = computed(() => (ios.value ? 'install.hintIOS' : 'install.hintDesktop'))

  return { deferred, installed, canPrompt, ios, showIOSHint, hintKey, initInstall, promptInstall }
}