<script setup>
import { computed, inject } from 'vue'
import IdCard from '../components/IdCard.vue'
import { auth, completeness, idStatus, missingFields, REQUIRED } from '../stores/auth'
import { cardData } from '../utils/idCard'
import { fmtDate, fmtDateTime } from '../utils/format'

const go = inject('go')
const user = auth.user
const card = computed(() => cardData(user.value))
const status = computed(() => idStatus(user.value))
const pct = computed(() => completeness(user.value))
const missing = computed(() => missingFields(user.value).map((k) => REQUIRED[k]))
const pending = computed(() => user.value.requests.filter((r) => r.status === 'Pending').length)
const statusClass = computed(() => ({ Active: 'ok', Incomplete: 'warn', Expired: 'bad' })[status.value])
const firstName = computed(() => user.value.fullName.split(' ')[0])
</script>

<template>
  <div class="page">
    <p class="hello">Hello, <strong>{{ firstName }}</strong>. Here is your ID at a glance.</p>

    <section class="hero">
      <div class="card-col">
        <IdCard :student="card" :width="290" />
        <button class="btn ghost" @click="go('id')">View full ID</button>
      </div>

      <div class="side-col">
        <div class="stats">
          <article class="stat">
            <span>ID status</span>
            <span class="badge" :class="statusClass">{{ status }}</span>
          </article>
          <article class="stat">
            <span>Valid until</span>
            <strong>{{ fmtDate(user.validUntil) }}</strong>
          </article>
          <article class="stat">
            <span>Open requests</span>
            <strong>{{ pending }}</strong>
          </article>
        </div>

        <div class="panel">
          <div class="row">
            <h2>Profile completeness</h2>
            <strong class="pct">{{ pct }}%</strong>
          </div>
          <div class="meter" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100"><i :style="{ width: pct + '%' }" /></div>
          <p v-if="missing.length" class="sub">
            Your ID is not active yet. Still needed: {{ missing.join(', ') }}.
          </p>
          <p v-else class="sub">All required details are in. Your digital ID is active.</p>
          <button v-if="missing.length" class="btn small" @click="go('profile')">Complete my information</button>
        </div>

        <div class="panel">
          <h2>Quick actions</h2>
          <div class="actions">
            <button class="btn ghost" @click="go('profile')">Update information</button>
            <button class="btn ghost" @click="go('id')">Download ID</button>
            <button class="btn ghost" @click="go('requests')">Request replacement</button>
          </div>
        </div>

        <div class="panel">
          <h2>Recent activity</h2>
          <ul class="log">
            <li v-for="(a, i) in user.activity.slice(0, 5)" :key="i">
              <span>{{ a.text }}</span>
              <time>{{ fmtDateTime(a.at) }}</time>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page { display: grid; gap: 20px; }
.hello { color: var(--muted); }
.hello strong { color: var(--g900); }
.hero { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: clamp(20px, 3vw, 44px); align-items: start; }
.card-col { display: grid; gap: 16px; justify-items: stretch; position: sticky; top: 20px; }
.side-col { display: grid; gap: 18px; min-width: 0; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
.stat { background: #fff; border: 1px solid var(--line); border-radius: var(--radius); padding: 18px 20px; display: grid; gap: 8px; align-content: start; justify-items: start; }
.stat > span:first-child { color: var(--muted); font-size: 0.85rem; font-weight: 600; }
.stat strong { font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; }
.row { display: flex; justify-content: space-between; align-items: baseline; }
.pct { font-size: 1.4rem; font-weight: 800; color: var(--g700); }
.meter { height: 10px; border-radius: 99px; background: var(--mint); margin: 12px 0 14px; overflow: hidden; }
.meter i { display: block; height: 100%; background: var(--g500); border-radius: 99px; }
.panel .btn.small { margin-top: 14px; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.log { list-style: none; margin: 12px 0 0; padding: 0; }
.log li { display: flex; justify-content: space-between; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--line); font-size: 0.92rem; }
.log li:last-child { border-bottom: 0; }
.log time { color: var(--muted); font-size: 0.82rem; white-space: nowrap; }

@media (max-width: 860px) {
  .hero { grid-template-columns: 1fr; }
  .card-col { position: static; justify-items: center; }
  .card-col .btn { width: 290px; max-width: 100%; }
}
</style>
