<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { usePending } from '~/composables/usePending'
import { useVault } from '~/composables/useVault'
import { unpack, type ProfilePayload } from '~/utils/share'

const { t } = useI18n()
const vault = useVault()
const pending = usePending()
const route = useRoute()

onMounted(async () => {
  const data = String(route.params.data ?? '')
  let profile: ProfilePayload
  try {
    profile = await unpack<ProfilePayload>(data)
  } catch {
    vault.flash(t('error.link'), 'error')
    return navigateTo('/')
  }

  if (!vault.identity.value) {
    pending.profile.value = profile
    return navigateTo('/')
  }

  try {
    const contact = await vault.addContactShare(profile.n, profile.c)
    vault.flash(t('contacts.added', { name: contact.name }))
  } catch {
    vault.flash(t('error.link'), 'error')
  }
  navigateTo('/')
})
</script>

<template>
  <main class="page">
    <p class="empty">{{ t('error.link') }}</p>
  </main>
</template>