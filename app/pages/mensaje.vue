<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { usePending } from '~/composables/usePending'
import { useVault } from '~/composables/useVault'

const { t, date } = useI18n()
const vault = useVault()
const pending = usePending()

const mensaje = computed(() => pending.opened.value)
const sender = computed(() => {
  if (!mensaje.value) return null
  return vault.contacts.value.find(c => c.id === mensaje.value!.fid) || null
})

const responder = () => {
  if (sender.value) navigateTo(`/escribir/${sender.value.id}`)
}
</script>

<template>
  <main class="page">
    <div class="page__head">
      <p class="eyebrow">{{ t('nav.home') }}</p>
      <h1>{{ t('message.title', { name: mensaje?.from ?? '—' }) }}</h1>
      <p class="lead">{{ mensaje ? date(mensaje.ts) : '' }}</p>
    </div>

    <section v-if="mensaje" class="block">
      <pre class="message__text">{{ mensaje.text }}</pre>
      <div class="block__head" style="border-bottom: none; border-top: 1px solid var(--line)">
        <p class="note">{{ t('message.footer') }}</p>
      </div>
    </section>

    <div v-if="mensaje" class="row__actions">
      <CopyButton
        :label="t('message.copy')"
        :copied-label="t('message.copied')"
        :content="() => mensaje?.text ?? ''"
      />
      <button v-if="sender" class="btn btn--primary" @click="responder">{{ t('message.reply') }}</button>
    </div>

    <p v-else class="empty">{{ t('message.notForYou') }}</p>
  </main>
</template>