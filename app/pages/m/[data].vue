<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { usePending } from '~/composables/usePending'
import { useVault } from '~/composables/useVault'
import { decryptEnvelope } from '~/utils/pki'
import { unpack, type MessagePayload } from '~/utils/share'

const { t } = useI18n()
const vault = useVault()
const pending = usePending()
const route = useRoute()

onMounted(async () => {
  const data = String(route.params.data ?? '')
  let message: MessagePayload
  try {
    message = await unpack<MessagePayload>(data)
  } catch {
    vault.flash(t('error.link'), 'error')
    return navigateTo('/')
  }

  if (!vault.identity.value) {
    pending.message.value = message
    return navigateTo('/')
  }

  try {
    pending.opened.value = await decryptEnvelope(message, await vault.keys())
    navigateTo('/mensaje')
  } catch {
    vault.flash(t('message.notForYou'), 'error')
    navigateTo('/')
  }
})
</script>

<template>
  <main class="page">
    <p class="empty">{{ t('error.link') }}</p>
  </main>
</template>