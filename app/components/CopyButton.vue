<script setup lang="ts">
import { ref } from 'vue'
import { copyText } from '~/composables/useVault'

const props = defineProps<{
  label: string
  copiedLabel: string
  content: () => string | Promise<string>
  wide?: boolean
  variant?: 'primary' | 'quiet'
  beforeCopy?: () => void | Promise<void>
}>()

const done = ref(false)
const busy = ref(false)

const run = async () => {
  busy.value = true
  try {
    await props.beforeCopy?.()
    await copyText(await props.content())
    done.value = true
    window.setTimeout(() => (done.value = false), 2200)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <button
    class="btn"
    :class="[variant === 'quiet' ? 'btn--quiet' : 'btn--primary', { 'btn--wide': wide }]"
    :disabled="busy"
    @click="run"
  >
    <span v-if="done" class="btn__check" aria-hidden="true">✓</span>
    {{ done ? copiedLabel : label }}
  </button>
</template>