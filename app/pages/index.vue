<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Contact } from '~/utils/pki'
import { readFile, useVault } from '~/composables/useVault'
import { useI18n } from '~/composables/useI18n'
import { usePending } from '~/composables/usePending'
import { decryptEnvelope } from '~/utils/pki'
import { profileLink } from '~/utils/share'

const { t, greeting } = useI18n()
const vault = useVault()
const pending = usePending()
const router = useRouter()

const name = ref('')
const busy = ref(false)
const query = ref('')
const confirming = ref<string | null>(null)

const contactCount = computed(() => vault.contacts.value.length)
const contactLabel = computed(() =>
  contactCount.value === 0
    ? t('home.contactsEmpty')
    : contactCount.value === 1
      ? t('home.contactsOne')
      : t('home.contactsMany', { n: contactCount.value })
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return vault.contacts.value
  return vault.contacts.value.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
})

const initials = (contactName: string) =>
  contactName
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase()

const write = (contact: Contact) => navigateTo(`/escribir/${contact.id}`)

const remove = (contact: Contact) => {
  vault.removeContact(contact.id)
  confirming.value = null
}

const profileUrl = () => profileLink(vault.shareProfile())

const create = async () => {
  if (!name.value.trim()) return vault.flash(t('welcome.needName'), 'error')
  busy.value = true
  try {
    await vault.create(name.value)
    await consume()
  } catch (error) {
    vault.flash((error as Error).message, 'error')
  } finally {
    busy.value = false
  }
}

const importar = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  busy.value = true
  try {
    const result = await vault.importProfile(await readFile(file))
    vault.flash(
      result.contacts === 1
        ? t('profile.importedOne', { name: result.name })
        : t('profile.imported', { name: result.name, n: result.contacts })
    )
    await consume()
  } catch (error) {
    vault.flash((error as Error).message, 'error')
  } finally {
    busy.value = false
    input.value = ''
  }
}

/** Aplica lo que haya quedado pendiente de un enlace. */
const consume = async () => {
  const profile = pending.profile.value
  if (profile) {
    pending.profile.value = null
    try {
      const contact = await vault.addContactShare(profile.n, profile.c)
      vault.flash(t('contacts.added', { name: contact.name }))
    } catch {
      vault.flash(t('error.link'), 'error')
    }
  }

  const message = pending.message.value
  if (message) {
    pending.message.value = null
    try {
      pending.opened.value = await decryptEnvelope(message, await vault.keys())
      router.push('/mensaje')
      return
    } catch {
      vault.flash(t('message.notForYou'), 'error')
    }
  }
  router.push('/')
}

</script>

<template>
  <!-- sin perfil: bienvenida -->
  <main v-if="!vault.identity.value" class="page">
    <div class="page__head">
      <p class="eyebrow">{{ t('brand.tagline') }}</p>
      <h1>{{ t('welcome.title') }}</h1>
      <p class="lead">{{ t('welcome.lead') }}</p>
    </div>

    <form class="block" @submit.prevent="create">
      <div class="block__body">
        <label>
          <span class="label">{{ t('welcome.name') }}</span>
          <input v-model="name" :placeholder="t('welcome.placeholder')" autocomplete="name" autofocus />
        </label>
        <button class="btn btn--primary btn--wide" type="submit" :disabled="busy">
          {{ busy ? t('welcome.starting') : t('welcome.start') }}
        </button>

        <div class="divider">{{ t('welcome.or') }}</div>

        <label class="picker">
          <input type="file" accept=".json,application/json" @change="importar" />
          <span>{{ t('welcome.import') }}</span>
        </label>
        <p class="note">{{ t('welcome.importHint') }}</p>
        <p class="note">
          {{ t('welcome.terms') }}
          <NuxtLink to="/terminos" style="text-decoration: underline">{{ t('nav.terms') }}</NuxtLink>
        </p>
      </div>
    </form>
  </main>

  <!-- con perfil: inicio -->
  <main v-else class="page">
    <div class="page__head">
      <p class="eyebrow">{{ t('nav.home') }}</p>
      <h1>{{ greeting(vault.identity.value.name) }}</h1>
      <p class="lead">{{ t('home.lead') }}</p>
    </div>

    <section class="block">
      <div class="block__head">
        <span class="eyebrow">{{ t('profile.link') }}</span>
      </div>
      <div class="block__body">
        <CopyButton
          :label="t('home.copy')"
          :copied-label="t('home.copied')"
          :content="profileUrl"
          wide
        />
        <p class="note">{{ t('home.linkHint') }}</p>
      </div>
    </section>

    <section class="block">
      <div class="block__head">
        <span class="eyebrow">{{ t('home.contacts') }}</span>
        <span class="eyebrow num" style="color: var(--ink-4)">{{ contactCount }}</span>
      </div>
      <div class="block__body block__body--flush">
        <p v-if="!contactCount" class="empty">{{ t('contacts.empty') }}</p>
        <template v-else>
          <div v-if="contactCount > 4" style="padding: 14px 18px; border-bottom: 1px solid var(--line)">
            <input v-model="query" type="search" :placeholder="t('contacts.search')" />
          </div>
          <p v-if="!filtered.length" class="empty">{{ t('contacts.none') }}</p>
          <div v-for="contact in filtered" :key="contact.id" class="row">
            <span class="row__avatar">{{ initials(contact.name) }}</span>
            <span class="row__main">
              <span class="row__name">{{ contact.name }}</span>
              <span class="row__meta">{{ contact.id.slice(0, 16) }}</span>
            </span>
            <span class="row__actions">
              <template v-if="confirming === contact.id">
                <button class="btn btn--danger btn--tiny" @click="remove(contact)">{{ t('contacts.yes') }}</button>
                <button class="btn btn--quiet btn--tiny" @click="confirming = null">{{ t('contacts.cancel') }}</button>
              </template>
              <template v-else>
                <button class="btn btn--primary btn--tiny" @click="write(contact)">{{ t('contacts.write') }}</button>
                <button class="btn btn--quiet btn--tiny btn--danger" @click="confirming = contact.id">
                  {{ t('contacts.remove') }}
                </button>
              </template>
            </span>
          </div>
        </template>
      </div>
      <div v-if="contactCount" class="block__head" style="border-top: 1px solid var(--line); border-bottom: none">
        <span class="note">{{ contactLabel }}</span>
      </div>
    </section>

  </main>
</template>