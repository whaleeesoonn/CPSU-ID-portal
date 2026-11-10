<script setup>
import { reactive, ref } from 'vue'
import AuthShell from '../components/AuthShell.vue'
import { auth } from '../stores/auth'

const emit = defineEmits(['login', 'success'])
const form = reactive({ fullName: '', idNumber: '', password: '' })
const error = ref({ field: '', message: '' })
const loading = ref(false)

async function submit() {
  error.value = { field: '', message: '' }
  loading.value = true
  const res = await auth.register(form)
  loading.value = false
  if (!res.ok) {
    error.value = res // flow: "try again" keeps the user on the input step
    return
  }
  emit('success') // flow: continue to the login form
}

const bad = (f) => error.value.field === f || (error.value.field === 'form' && !form[f])
</script>

<template>
  <AuthShell>
    <form class="form" novalidate @submit.prevent="submit">
      <div>
        <h2>Create your account</h2>
        <p class="lead">Register with your student ID number.</p>
      </div>

      <p v-if="error.field === 'form'" class="alert error" role="alert">{{ error.message }}</p>

      <div class="field">
        <label for="fullName">Full name</label>
        <input id="fullName" v-model="form.fullName" class="input" :class="{ invalid: bad('fullName') }" placeholder="First name, middle name, last name" autocomplete="name" />
      </div>
      <div class="field">
        <label for="idNumber">ID number</label>
        <input id="idNumber" v-model="form.idNumber" class="input" :class="{ invalid: bad('idNumber') }" placeholder="e.g. 2026-0123" autocomplete="username" />
        <span v-if="error.field === 'idNumber'" class="field-error" role="alert">{{ error.message }}</span>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" class="input" :class="{ invalid: bad('password') }" placeholder="Create a password" autocomplete="new-password" />
        <span v-if="error.field === 'password'" class="field-error" role="alert">{{ error.message }}</span>
        <span v-else class="hint">At least 6 characters. Letters and numbers only.</span>
      </div>

      <button class="btn" :disabled="loading">{{ loading ? 'Creating account…' : 'Register' }}</button>
      <p class="switch">Already registered? <a href="#" @click.prevent="emit('login')">Log in</a></p>
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
</style>
