<script setup>
import { ref } from 'vue'
import { auth } from './stores/auth'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import DashboardLayout from './views/DashboardLayout.vue'

// 'login' | 'register' | 'dashboard' (no router needed)
const page = ref(auth.user.value ? 'dashboard' : 'login')
const justRegistered = ref(false)

function onRegistered() {
  justRegistered.value = true
  page.value = 'login'
}
function go(next) {
  if (next !== 'login') justRegistered.value = false
  page.value = next
}
function logout() {
  auth.logout()
  justRegistered.value = false
  page.value = 'login'
}
</script>

<template>
  <LoginView v-if="page === 'login'" :registered="justRegistered" @register="go('register')" @success="page = 'dashboard'" />
  <RegisterView v-else-if="page === 'register'" @login="go('login')" @success="onRegistered" />
  <DashboardLayout v-else @logout="logout" />
</template>
