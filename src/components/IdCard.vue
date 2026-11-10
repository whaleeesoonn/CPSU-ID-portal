<script setup>
import { ref, watch, computed } from 'vue'
import { makeQr, qrText } from '../utils/idCard'
import { initials } from '../utils/format'

const props = defineProps({
  student: { type: Object, required: true },
  side: { type: String, default: 'front' },
  width: { type: Number, default: 270 },
})

const qr = ref('')
watch(() => qrText(props.student), async (t) => (qr.value = await makeQr(t)), { immediate: true })

const valid = computed(() =>
  new Date(props.student.validUntil).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }),
)
</script>

<template>
  <div class="card" :style="{ '--w': width + 'px' }">
    <template v-if="side === 'front'">
      <div class="head">
        <img src="/cpsu-logo.png" alt="" class="logo" />
        <div>
          <strong>CENTRAL PHILIPPINES<br />STATE UNIVERSITY</strong>
          <span>San Carlos Campus</span>
        </div>
      </div>
      <div class="photo">
        <img v-if="student.photo" :src="student.photo" :alt="`Photo of ${student.name}`" />
        <span v-else>{{ initials(student.name) }}</span>
      </div>
      <div class="body">
        <h3>{{ student.name }}</h3>
        <p>{{ student.course || 'Program not set' }}</p>
        <p>{{ student.yearLevel ? `Year ${student.yearLevel}` : 'Year level not set' }}</p>
        <strong class="idno">{{ student.idNumber }}</strong>
        <small>Student ID number</small>
      </div>
      <div class="stripe">QUALITY EDUCATION • GLOBAL COMPETITIVENESS</div>
    </template>

    <template v-else>
      <div class="head back-head"><strong>Scan to verify this ID</strong></div>
      <img v-if="qr" :src="qr" alt="QR code for ID verification" class="qr" />
      <div class="info">
        <small>Valid until</small>
        <b>{{ valid }}</b>
        <small>In case of emergency</small>
        <b>{{ [student.emergencyName, student.emergencyContact].filter(Boolean).join(' • ') || 'Not provided' }}</b>
        <p class="return">If found, please return to CPSU San Carlos Campus, Negros Occidental.</p>
      </div>
      <div class="stripe thin" />
    </template>
  </div>
</template>

<style scoped>
.card {
  position: relative; overflow: hidden; width: var(--w); aspect-ratio: 540 / 860; font-size: calc(var(--w) / 27);
  background: #fff; border-radius: 1.8em; box-shadow: 0 1.6em 3em -1.2em rgba(11, 61, 42, 0.45), 0 0 0 1px rgba(11, 61, 42, 0.06);
  color: var(--g900); flex: none;
}
.head { height: 12.5em; background: var(--g700); color: #fff; display: flex; gap: 0.9em; align-items: flex-start; padding: 1.7em 1.6em 0; }
.head strong { display: block; font-size: 1.22em; line-height: 1.3; font-weight: 800; }
.head span { display: block; margin-top: 0.4em; font-size: 1em; font-weight: 600; opacity: 0.9; }
.logo { width: 4.6em; height: 4.6em; flex: none; }
.photo {
  position: absolute; top: 7.5em; left: 50%; transform: translateX(-50%); width: 10.5em; height: 13.1em;
  border: 0.4em solid #fff; border-radius: 1.1em; background: var(--mint); overflow: hidden; display: grid; place-items: center;
}
.photo img { width: 100%; height: 100%; object-fit: cover; }
.photo span { font-size: 4em; font-weight: 800; color: #9ccdb2; }
.body { position: absolute; top: 21.6em; left: 0; right: 0; text-align: center; padding: 0 1em; display: grid; gap: 0.15em; }
.body h3 { font-size: 1.7em; font-weight: 800; line-height: 1.15; margin-bottom: 0.25em; text-wrap: balance; }
.body p { font-size: 1.05em; font-weight: 600; color: #4d7a65; }
.idno { margin-top: 0.9em; font-size: 2.2em; font-weight: 800; color: var(--g700); letter-spacing: 0.01em; }
.body small { font-size: 0.95em; font-weight: 600; color: #4d7a65; }
.stripe { position: absolute; left: 0; right: 0; bottom: 0; height: 3.5em; background: var(--gold); display: grid; place-items: center; font-size: 0.78em; font-weight: 800; letter-spacing: 0.02em; }
.stripe.thin { height: 2em; }
.back-head { height: 5em; align-items: center; justify-content: center; padding: 0; }
.back-head strong { font-size: 1.4em; }
.qr { display: block; width: 15em; height: 15em; margin: 1.5em auto 0; }
.info { padding: 1.6em 2.4em; display: grid; gap: 0.2em; }
.info small { font-size: 0.95em; font-weight: 600; color: #4d7a65; margin-top: 0.8em; }
.info b { font-size: 1.15em; font-weight: 700; line-height: 1.3; }
.return { margin-top: 1.4em; font-size: 0.9em; color: #4d7a65; line-height: 1.45; }
</style>
