<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useVault } from '~/composables/useVault'
import { encryptMessage } from '~/utils/pki'
import { messageLink } from '~/utils/share'

const { t } = useI18n()
const vault = useVault()
const route = useRoute()

const id = computed(() => String(route.params.id))
const contact = computed(() => vault.contacts.value.find(c => c.id === id.value) || null)
const message = ref('')
const link = ref('')

const build = async () => {
  if (!contact.value) throw new Error('contacto desconocido')
  if (!message.value.trim()) {
    vault.flash(t('compose.needText'), 'error')
    throw new Error('empty')
  }
  const envelope = await encryptMessage(message.value, contact.value, vault.identity.value?.name || 'alguien', vault.identity.value?.id)
  link.value = await messageLink(envelope)
  return envelope
}

const content = async () => {
  await build()
  return link.value
}
</script>

<template>
  <main class="page">
    <div class="page__head">
      <NuxtLink to="/" class="eyebrow">← {{ t('compose.back') }}</NuxtLink>
      <h1>{{ t('compose.title', { name: contact?.name ?? '…' }) }}</h1>
      <p class="lead">{{ t('compose.lead', { name: contact?.name ?? '…' }) }}</p>
    </div>

    <section v-if="contact" class="block">
      <div class="block__body">
        <label>
          <textarea v-model="message" :placeholder="t('compose.placeholder')" autofocus />
        </label>
        <CopyButton
          :label="t('compose.copy')"
          :copied-label="t('compose.copied')"
          :content="content"
          wide
        />
        <p class="note">{{ t('compose.sendHint', { name: contact.name }) }}</p>
      </div>
    </section>

    <p v-else class="empty">{{ t('error.link') }}</p>
  </main>
</template>