<script setup>
import { reactive, ref } from 'vue'
import { auth } from '../stores/auth'
import { fmtDateTime } from '../utils/format'

const user = auth.user
const TYPES = ['Replacement (lost)', 'Replacement (damaged)', 'Renewal', 'Information correction']
const form = reactive({ type: TYPES[0], details: '' })
const error = ref('')
const sent = ref(false)

function submit() {
  sent.value = false
  error.value = ''
  if (!form.details.trim()) {
    error.value = 'Add a short explanation so the ID office can process your request.'
    return
  }
  auth.addRequest({ type: form.type, details: form.details.trim() })
  form.details = ''
  sent.value = true
}

const tone = { Pending: 'warn', Approved: 'ok', Cancelled: 'muted', Rejected: 'bad' }
</script>

<template>
  <div class="page">
    <form class="panel" novalidate @submit.prevent="submit">
      <h2>New request</h2>
      <p class="sub">Lost or damaged card, renewal, or a correction to your printed details.</p>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <p v-if="sent" class="alert success" role="status">Request submitted. It will show as pending until the ID office reviews it.</p>
      <div class="grid">
        <div class="field">
          <label for="type">Request type</label>
          <select id="type" v-model="form.type" class="input"><option v-for="t in TYPES" :key="t">{{ t }}</option></select>
        </div>
        <div class="field">
          <label for="details">Details</label>
          <textarea id="details" v-model="form.details" class="input" placeholder="Describe what happened or what needs to change." />
        </div>
        <div><button class="btn">Submit request</button></div>
      </div>
    </form>

    <section class="panel">
      <h2>Your requests</h2>
      <p v-if="!user.requests.length" class="sub">No requests yet. Submit one above when you need a new or corrected ID.</p>
      <ul v-else class="list">
        <li v-for="r in user.requests" :key="r.id">
          <div>
            <strong>{{ r.type }}</strong>
            <span>{{ r.id }} · {{ fmtDateTime(r.at) }}</span>
            <p>{{ r.details }}</p>
          </div>
          <div class="end">
            <span class="badge" :class="tone[r.status]">{{ r.status }}</span>
            <button v-if="r.status === 'Pending'" class="btn danger small" @click="auth.cancelRequest(r.id)">Cancel</button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page { display: grid; gap: 18px; max-width: 900px; }
.grid { display: grid; gap: 16px; margin-top: 16px; }
.alert { margin-top: 14px; }
.list { list-style: none; margin: 8px 0 0; padding: 0; }
.list li { display: flex; justify-content: space-between; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--line); }
.list li:last-child { border-bottom: 0; }
.list strong { display: block; }
.list span:not(.badge) { font-size: 0.82rem; color: var(--muted); }
.list p { margin-top: 6px; color: #3d5d4d; font-size: 0.92rem; line-height: 1.5; }
.end { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex: none; }
@media (max-width: 560px) { .list li { flex-direction: column; } .end { flex-direction: row; align-items: center; } }
</style>
