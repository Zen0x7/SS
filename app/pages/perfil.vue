<script setup lang="ts">
import { computed, ref } from 'vue'
import { download, readFile, useVault } from '~/composables/useVault'
import { useI18n } from '~/composables/useI18n'
const { t, date } = useI18n()
const vault = useVault()
const { canPrompt, installed, showIOSHint, hintKey, promptInstall } = useInstall()
const confirming = ref(false)

onMounted(() => {
  if (!vault.identity.value) navigateTo('/')
})

const instalar = async () => {
  const result = await promptInstall()
  if (result === 'unavailable') vault.flash(t(hintKey.value))
  else if (result === 'dismissed') vault.flash(t('install.dismissed'))
}

const created = computed(() => (vault.identity.value ? date(vault.identity.value.created) : ''))

const descargar = () => {
  if (!vault.identity.value) return
  download(`${vault.identity.value.name}-perfil.json`, JSON.stringify(vault.profileBackup(), null, 2), 'application/json')
  vault.flash(t('profile.downloaded'))
}

const importar = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const result = await vault.importProfile(await readFile(file))
    vault.flash(
      result.contacts === 1
        ? t('profile.importedOne', { name: result.name })
        : t('profile.imported', { name: result.name, n: result.contacts })
    )
  } catch (error) {
    vault.flash((error as Error).message, 'error')
  } finally {
    input.value = ''
  }
}

const borrar = () => {
  vault.forgetAll()
  confirming.value = false
  navigateTo('/')
}
</script>

<template>
  <main v-if="vault.identity.value" class="page">
    <div class="page__head">
      <p class="eyebrow">{{ t('nav.profile') }}</p>
      <h1>{{ t('profile.title') }}</h1>
      <p class="lead">{{ t('profile.lead') }}</p>
    </div>

    <section class="block">
      <div class="block__body block__body--flush">
        <div class="fact">
          <span class="fact__key">{{ t('profile.name') }}</span>
          <span class="fact__val">{{ vault.identity.value.name }}</span>
        </div>
        <div class="fact">
          <span class="fact__key">{{ t('profile.id') }}</span>
          <span class="fact__val mono">{{ vault.identity.value.id }}</span>
        </div>
        <div class="fact">
          <span class="fact__key">{{ t('profile.created') }}</span>
          <span class="fact__val">{{ created }}</span>
        </div>
      </div>
    </section>


    <section class="block">
      <div class="block__head">
        <span class="eyebrow">{{ t('profile.backup') }}</span>
      </div>
      <div class="block__body">
        <p class="note">{{ t('profile.backupLead') }}</p>
        <div class="split">
          <button class="btn" @click="descargar">{{ t('profile.download') }}</button>
          <label class="picker" style="flex: 1">
            <input type="file" accept=".json,application/json" @change="importar" />
            <span>{{ t('profile.import') }}</span>
          </label>
        </div>
      </div>
    </section>


    <section class="block">
      <div class="block__head">
        <span class="eyebrow">{{ t('install.title') }}</span>
      </div>
      <div class="block__body">
        <p class="note">{{ t('install.lead') }}</p>
        <p v-if="installed" class="note">{{ t('install.done') }}</p>
        <template v-else>
          <button class="btn btn--primary" @click="instalar">{{ t('install.button') }}</button>
          <p v-if="!canPrompt" class="note">{{ showIOSHint ? t('install.ios') : t('install.unsupported') }}</p>
        </template>
      </div>
    </section>

    <section class="block">
      <div class="block__head">
        <span class="eyebrow" style="color: var(--danger)">{{ t('profile.danger') }}</span>
      </div>
      <div class="block__body">
        <p class="note note--warn">{{ t('profile.dangerLead') }}</p>
        <div class="row__actions">
          <template v-if="confirming">
            <button class="btn btn--danger" @click="borrar">{{ t('profile.resetConfirm') }}</button>
            <button class="btn btn--quiet" @click="confirming = false">{{ t('profile.cancel') }}</button>
          </template>
          <button v-else class="btn btn--danger" @click="confirming = true">{{ t('profile.reset') }}</button>
        </div>
      </div>
    </section>
  </main>
</template>