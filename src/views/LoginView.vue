<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AuthShell from '../components/AuthShell.vue'
import { auth, MAX_ATTEMPTS, LOCK_MINUTES } from '../stores/auth'

const props = defineProps({ registered: Boolean })
const emit = defineEmits(['register', 'success'])

const form = reactive({ idNumber: '', password: '' })
const error = ref('')
const left = ref(null)
const loading = ref(false)
const now = ref(Date.now())
let timer
onMounted(() => (timer = setInterval(() => (now.value = Date.now()), 1000)))
onBeforeUnmount(() => clearInterval(timer))

// Attempts check from the flowchart: after 5 wrong tries the form locks for 5 minutes.
const lockSeconds = computed(() => auth.lockSeconds(form.idNumber, now.value))
const countdown = computed(() => {
  const m = Math.floor(lockSeconds.value / 60)
  const s = String(lockSeconds.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

async function submit() {
  error.value = ''
  left.value = null
  loading.value = true
  const res = await auth.login(form)
  loading.value = false
  now.value = Date.now()
  if (res.ok) return emit('success')
  if (res.message) error.value = res.message
  if (res.left != null) left.value = res.left
}
</script>

<template>
  <AuthShell>
    <form class="form" novalidate @submit.prevent="submit">
      <div>
        <h2>Welcome back</h2>
        <p class="lead">Log in with your student ID number.</p>
      </div>

      <p v-if="registered && !error && !lockSeconds" class="alert success" role="status">Registration complete. Log in to continue.</p>
      <p v-if="lockSeconds" class="alert warn" role="alert">
        Too many failed attempts. Try again in <strong>{{ countdown }}</strong>.
      </p>
      <p v-else-if="error" class="alert error" role="alert">
        {{ error }}
        <template v-if="left != null"> {{ left }} {{ left === 1 ? 'attempt' : 'attempts' }} left before a {{ LOCK_MINUTES }}-minute lock.</template>
      </p>

      <div class="field">
        <label for="idNumber">ID number</label>
        <input id="idNumber" v-model="form.idNumber" class="input" :class="{ invalid: error }" placeholder="e.g. 2026-0001" autocomplete="username" :disabled="!!lockSeconds" />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" class="input" :class="{ invalid: error }" placeholder="Enter your password" autocomplete="current-password" :disabled="!!lockSeconds" />
      </div>

      <button class="btn" :disabled="loading || !!lockSeconds">{{ lockSeconds ? 'Login locked' : loading ? 'Checking…' : 'Log in' }}</button>

      <p class="switch">New here? <a href="#" @click.prevent="emit('register')">Create an account</a></p>
      <button type="button" class="demo" @click="((form.idNumber = '2026-0001'), (form.password = 'demo1234'))">
        Try the demo account (2026-0001 / demo1234)
      </button>
      <p class="hint">Maximum of {{ MAX_ATTEMPTS }} attempts.</p>
    </form>
  </AuthShell>
</template>

<style scoped>
.form { display: grid; gap: 18px; }
h2 { font-size: 1.15rem; font-weight: 700; }
.lead { color: var(--muted); margin-top: 4px; }
.switch { text-align: center; color: var(--muted); }
.switch a { color: var(--g700); font-weight: 700; text-decoration: none; }
.switch a:hover { text-decoration: underline; }
.demo { border: 1px dashed var(--mint-2); background: var(--paper); color: var(--g700); border-radius: 12px; padding: 10px 14px; font-size: 0.85rem; font-weight: 600; }
.demo:hover { background: var(--mint); }
.hint { text-align: center; }
</style>
