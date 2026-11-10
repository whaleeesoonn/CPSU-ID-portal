<script setup>
import { computed, inject, ref } from 'vue'
import IdCard from '../components/IdCard.vue'
import { auth, idStatus, missingFields, REQUIRED } from '../stores/auth'
import { cardData, downloadIdPng } from '../utils/idCard'

const go = inject('go')
const user = auth.user
const card = computed(() => cardData(user.value))
const status = computed(() => idStatus(user.value))
const missing = computed(() => missingFields(user.value).map((k) => REQUIRED[k]))
const printPage = () => window.print()
const busy = ref(false)
const error = ref('')

async function download() {
  busy.value = true
  error.value = ''
  try {
    await downloadIdPng(card.value)
  } catch {
    error.value = 'The ID image could not be created. Try again.'
  }
  busy.value = false
}
</script>

<template>
  <div class="page">
    <div class="bar no-print">
      <p class="sub">Front and back of your digital student ID. The QR code holds your ID number and validity.</p>
      <div class="btns">
        <button class="btn ghost" @click="printPage">Print</button>
        <button class="btn" :disabled="busy" @click="download">{{ busy ? 'Preparing…' : 'Download PNG' }}</button>
      </div>
    </div>

    <p v-if="error" class="alert error no-print" role="alert">{{ error }}</p>
    <p v-if="status !== 'Active'" class="alert warn no-print" role="status">
      <template v-if="status === 'Incomplete'">Your ID is incomplete. Add {{ missing.join(', ') }} in <a href="#" @click.prevent="go('profile')">Student Information</a>.</template>
      <template v-else>This ID has expired. Submit a renewal in <a href="#" @click.prevent="go('requests')">ID Requests</a>.</template>
    </p>

    <div class="cards">
      <figure><IdCard :student="card" side="front" :width="300" /><figcaption class="no-print">Front</figcaption></figure>
      <figure><IdCard :student="card" side="back" :width="300" /><figcaption class="no-print">Back</figcaption></figure>
    </div>
  </div>
</template>


<style scoped>
.page { display: grid; gap: 18px; }
.bar { display: flex; justify-content: space-between; gap: 16px; align-items: center; flex-wrap: wrap; }
.btns { display: flex; gap: 10px; }
.cards { display: flex; flex-wrap: wrap; gap: 32px; margin-top: 8px; }
figure { margin: 0; display: grid; gap: 12px; justify-items: center; }
figcaption { color: var(--muted); font-weight: 600; font-size: 0.9rem; }
.alert a { color: inherit; font-weight: 700; }
@media print { .cards { gap: 20px; flex-wrap: nowrap; } }
</style>
