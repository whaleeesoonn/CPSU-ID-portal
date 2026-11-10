<script setup>
import { reactive, ref } from 'vue'
import { auth } from '../stores/auth'

const user = auth.user
const form = reactive({ current: '', next: '', confirm: '' })
const error = ref('')
const ok = ref(false)

async function submit() {
  ok.value = false
  error.value = ''
  if (!form.current || !form.next || !form.confirm) return (error.value = 'Complete all password fields.')
  if (form.next !== form.confirm) return (error.value = 'New password and confirmation do not match.')
  const res = await auth.changePassword(form.current, form.next)
  if (!res.ok) return (error.value = res.message)
  Object.assign(form, { current: '', next: '', confirm: '' })
  ok.value = true
}
</script>

<template>
  <div class="page">
    <section class="panel">
      <h2>Account</h2>
      <dl>
        <div><dt>Name</dt><dd>{{ user.fullName }}</dd></div>
        <div><dt>ID number</dt><dd>{{ user.idNumber }}</dd></div>
      </dl>
    </section>

    <form class="panel" novalidate @submit.prevent="submit">
      <h2>Change password</h2>
      <p class="sub">Letters and numbers only, at least 6 characters.</p>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <p v-if="ok" class="alert success" role="status">Password changed.</p>
      <div class="grid">
        <div class="field"><label for="c">Current password</label><input id="c" v-model="form.current" type="password" class="input" autocomplete="current-password" /></div>
        <div class="field"><label for="n">New password</label><input id="n" v-model="form.next" type="password" class="input" autocomplete="new-password" /></div>
        <div class="field"><label for="f">Confirm new password</label><input id="f" v-model="form.confirm" type="password" class="input" autocomplete="new-password" /></div>
        <div><button class="btn">Update password</button></div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.page { display: grid; gap: 18px; max-width: 560px; }
dl { margin: 14px 0 0; display: grid; gap: 12px; }
dl div { display: flex; justify-content: space-between; gap: 12px; }
dt { color: var(--muted); }
dd { margin: 0; font-weight: 700; }
.alert { margin-top: 14px; }
.grid { display: grid; gap: 16px; margin-top: 16px; }
</style>
