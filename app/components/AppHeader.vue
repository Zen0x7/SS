<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { useVault } from '~/composables/useVault'

const { t, locale, setLocale, initLocale } = useI18n()
const vault = useVault()
const { installed, hintKey, promptInstall } = useInstall()
const open = ref(false)

const onInstall = async () => {
  const result = await promptInstall()
  if (result === 'unavailable') vault.flash(t(hintKey.value))
  else if (result === 'dismissed') vault.flash(t('install.dismissed'))
}

if (import.meta.client) {
  initLocale()
  vault.init()
}

const choose = (next: 'es' | 'en') => {
  setLocale(next)
  open.value = false
}

const labels: Record<string, string> = { es: 'Español', en: 'English' }
</script>

<template>
  <header class="topbar">
    <NuxtLink to="/" class="brand">
      <span class="brand__mark">SS</span>
      <span class="brand__text">
        <span class="brand__name">Servicio de Secretos</span>
        <span class="brand__tag">{{ t('brand.tagline') }}</span>
      </span>
    </NuxtLink>

    <div class="topbar__side">
      <button v-if="!installed" class="btn btn--quiet btn--tiny" @click="onInstall">{{ t('install') }}</button>
      <div class="lang">
        <button class="lang__btn" :aria-label="t('nav.language')" @click="open = !open">
          {{ locale.toUpperCase() }} <span aria-hidden="true">▾</span>
        </button>
        <div v-if="open" class="lang__menu">
          <button
            v-for="code in ['es', 'en']"
            :key="code"
            class="lang__opt"
            :class="{ 'lang__opt--on': locale === code }"
            @click="choose(code as 'es' | 'en')"
          >
            {{ labels[code] }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>