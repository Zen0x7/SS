<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { terms } from '~/utils/terms'

const { t, locale } = useI18n()
const doc = computed(() => terms[locale.value])
</script>

<template>
  <main class="page">
    <div class="page__head">
      <p class="eyebrow">{{ t('nav.terms') }}</p>
      <h1>{{ doc.title }}</h1>
      <p class="lead">{{ doc.intro }}</p>
      <p class="eyebrow num">{{ doc.updated }}</p>
    </div>

    <section v-for="(section, index) in doc.sections" :key="section.h" class="block">
      <div class="block__head">
        <span class="eyebrow num">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="eyebrow" style="color: var(--ink-3)">{{ section.h }}</span>
      </div>
      <div class="block__body">
        <p v-for="(paragraph, i) in section.p" :key="i" class="lead">{{ paragraph }}</p>
      </div>
    </section>

    <p class="note">{{ doc.note }}</p>
  </main>
</template>