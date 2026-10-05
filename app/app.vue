<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { useVault } from '~/composables/useVault'

const { t, initLocale } = useI18n()
const vault = useVault()
const { initInstall } = useInstall()

if (import.meta.client) {
  initLocale()
  vault.init()
  initInstall(() => vault.flash(t('install.done')))
}

const version = '1.0.0'
const year = new Date().getFullYear()
</script>

<template>
  <div class="shell">
    <AppHeader />

    <nav class="nav">
      <NuxtLink to="/" class="nav__item" exact-active-class="nav__item--on">{{ t('nav.home') }}</NuxtLink>
      <NuxtLink v-if="vault.identity.value" to="/perfil" class="nav__item" exact-active-class="nav__item--on">
        {{ t('nav.profile') }}
      </NuxtLink>
      <NuxtLink to="/terminos" class="nav__item" exact-active-class="nav__item--on">{{ t('nav.terms') }}</NuxtLink>
    </nav>

    <NuxtPage />

    <footer class="foot">
      <img class="foot__avatar" src="/avatar.png" alt="Ian Torres" width="76" height="76" />
      <p class="foot__by">{{ t('footer.by') }} <strong>Ian Torres</strong></p>
      <p class="foot__rights">© {{ year }} · {{ t('footer.rights') }}</p>
      <a class="foot__link" href="https://github.com/Zen0x7/SS" target="_blank" rel="noopener noreferrer">
        <GitHubIcon />
        <span>{{ t('footer.source') }}</span>
      </a>
      <span class="foot__ver num">{{ t('footer.version', { version }) }}</span>
    </footer>

    <p v-if="vault.notice.value" class="toast" :class="{ 'toast--error': vault.notice.value.kind === 'error' }">
      {{ vault.notice.value.text }}
    </p>
  </div>
</template>