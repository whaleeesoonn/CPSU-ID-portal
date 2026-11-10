<script setup>
import { computed, provide, ref } from 'vue'
import { auth } from '../stores/auth'
import { initials } from '../utils/format'
import HomeView from './HomeView.vue'
import ProfileView from './ProfileView.vue'
import IdView from './IdView.vue'
import RequestsView from './RequestsView.vue'
import SettingsView from './SettingsView.vue'

const emit = defineEmits(['logout'])
const tab = ref('home')
const open = ref(false)
const user = auth.user

const nav = [
  { key: 'home', label: 'Dashboard', view: HomeView, icon: 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z' },
  { key: 'profile', label: 'Student Information', view: ProfileView, icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5z' },
  { key: 'id', label: 'Digital ID', view: IdView, icon: 'M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm3 4a2 2 0 100 4 2 2 0 000-4zm-3 8h6v-.5C10 15.6 8.7 15 7 15s-3 .6-3 1.5V17zm9-7h6v1.6h-6V10zm0 3h6v1.6h-6V13z' },
  { key: 'requests', label: 'ID Requests', view: RequestsView, icon: 'M6 3h9l4 4v14H6V3zm8 1.5V8h3.5L14 4.5zM9 12h7v1.6H9V12zm0 3.4h7V17H9v-1.6z' },
  { key: 'settings', label: 'Settings', view: SettingsView, icon: 'M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm8.4-3.5l1.6-1.2-1.8-3.1-1.9.7a7 7 0 00-1.6-.9L16.3 5h-3.6l-.4 2a7 7 0 00-1.6.9l-1.9-.7-1.8 3.1L8.6 12l-1.6 1.2 1.8 3.1 1.9-.7c.5.4 1 .7 1.6.9l.4 2h3.6l.4-2c.6-.2 1.1-.5 1.6-.9l1.9.7 1.8-3.1L20.4 12z' },
]
const current = computed(() => nav.find((n) => n.key === tab.value))

function go(key) {
  tab.value = key
  open.value = false
  window.scrollTo({ top: 0 })
}
provide('go', go)
</script>

<template>
  <div class="app">
    <div v-if="open" class="scrim no-print" @click="open = false" />
    <aside class="side no-print" :class="{ open }">
      <div class="brand">
        <img src="/cpsu-logo.png" alt="CPSU seal" />
        <div>
          <strong>CPSU</strong>
          <span>San Carlos Campus</span>
        </div>
      </div>
      <p class="sys">Digital ID Information Management System</p>

      <nav aria-label="Main">
        <button v-for="n in nav" :key="n.key" class="link" :class="{ active: tab === n.key }" :aria-current="tab === n.key ? 'page' : undefined" @click="go(n.key)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="n.icon" /></svg>
          {{ n.label }}
        </button>
      </nav>

      <div class="me">
        <span class="avatar">
          <img v-if="user.profile.photo" :src="user.profile.photo" alt="" />
          <template v-else>{{ initials(user.fullName) }}</template>
        </span>
        <div class="who">
          <strong>{{ user.fullName }}</strong>
          <span>{{ user.idNumber }}</span>
        </div>
      </div>
      <button class="out" @click="emit('logout')">Log out</button>
    </aside>

    <div class="main">
      <header class="top no-print">
        <button class="burger" aria-label="Open menu" @click="open = true">
          <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <h1>{{ current.label }}</h1>
      </header>
      <main class="content"><component :is="current.view" :key="tab" /></main>
    </div>
  </div>
</template>

<style scoped>
.app { display: grid; grid-template-columns: 264px minmax(0, 1fr); min-height: 100vh; width: 100%; }
.side { position: sticky; top: 0; height: 100vh; background: #fff; border-right: 1px solid var(--line); padding: 22px 16px; display: flex; flex-direction: column; gap: 6px; }
.brand { display: flex; gap: 12px; align-items: center; padding: 0 6px; }
.brand img { width: 46px; height: 46px; }
.brand strong { display: block; font-size: 1.2rem; color: var(--g900); letter-spacing: 0.01em; }
.brand span { font-size: 0.82rem; color: var(--muted); }
.sys { font-size: 0.82rem; color: var(--muted); margin: 12px 6px 22px; line-height: 1.45; }
nav { display: grid; gap: 4px; }
.link {
  display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; border: 0; background: transparent;
  width: 100%; text-align: left; color: #3d5d4d; font-weight: 600; font-size: 0.95rem; transition: background 0.15s;
}
.link svg { width: 20px; height: 20px; fill: currentColor; flex: none; }
.link:hover { background: var(--paper); }
.link.active { background: var(--mint); color: var(--g700); }
.me { margin-top: auto; display: flex; align-items: center; gap: 12px; padding: 14px 6px 10px; border-top: 1px solid var(--line); }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--g700); color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 0.9rem; flex: none; overflow: hidden; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.who { min-width: 0; }
.who strong { display: block; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.who span { font-size: 0.8rem; color: var(--muted); }
.out { border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 10px; font-weight: 600; color: var(--g700); }
.out:hover { background: var(--paper); }

.main { min-width: 0; display: flex; flex-direction: column; }
.top { display: flex; align-items: center; gap: 14px; padding: 26px clamp(18px, 3vw, 44px) 0; }
.top h1 { font-size: clamp(1.45rem, 2.3vw, 1.9rem); font-weight: 800; letter-spacing: -0.02em; color: var(--g900); }
.burger { display: none; width: 42px; height: 42px; border-radius: 12px; border: 1px solid var(--line); background: #fff; place-items: center; }
.burger svg { width: 22px; height: 22px; stroke: var(--g800); stroke-width: 2; fill: none; stroke-linecap: round; }
.content { padding: 22px clamp(18px, 3vw, 44px) 56px; flex: 1; }
.scrim { display: none; }

@media (max-width: 960px) {
  .app { grid-template-columns: 1fr; }
  .side { position: fixed; z-index: 30; inset: 0 auto 0 0; width: min(290px, 84vw); transform: translateX(-100%); transition: transform 0.22s ease; box-shadow: 0 0 40px rgba(11, 61, 42, 0.25); }
  .side.open { transform: none; }
  .scrim { display: block; position: fixed; inset: 0; z-index: 20; background: rgba(11, 61, 42, 0.4); }
  .burger { display: grid; }
}
@media (max-width: 960px) and (prefers-reduced-motion: reduce) { .side { transition: none; } }
</style>
