<script setup>
import { reactive, ref } from 'vue'
import { auth, COURSES } from '../stores/auth'
import { initials } from '../utils/format'

const user = auth.user
const p = user.value.profile
const form = reactive({ fullName: user.value.fullName, ...p })
const saved = ref(false)
const error = ref('')
const phone = /^[0-9+\-\s]{7,15}$/

function pickPhoto(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'Choose an image file (JPG or PNG).'
    return
  }
  const img = new Image()
  img.onload = () => {
    // Crop to a 3:4 portrait and shrink so it fits in browser storage.
    const w = 300, h = 400
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const scale = Math.max(w / img.width, h / img.height)
    const sw = w / scale, sh = h / scale
    c.getContext('2d').drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, w, h)
    form.photo = c.toDataURL('image/jpeg', 0.85)
    error.value = ''
    URL.revokeObjectURL(img.src)
  }
  img.src = URL.createObjectURL(file)
}

function save() {
  saved.value = false
  error.value = ''
  if (!form.fullName.trim()) return (error.value = 'Enter your full name.')
  for (const [k, label] of [['contactNumber', 'Contact number'], ['guardianContact', 'Emergency contact number']]) {
    if (form[k] && !phone.test(form[k])) return (error.value = `${label} can only use numbers, spaces, + and -.`)
  }
  const { fullName, ...profile } = form
  auth.updateProfile(profile, { fullName })
  saved.value = true
}
</script>

<template>
  <form class="page" novalidate @submit.prevent="save">
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <p v-if="saved" class="alert success" role="status">Changes saved. Your digital ID is updated.</p>

    <section class="panel">
      <h2>ID photo</h2>
      <p class="sub">Use a recent, front-facing photo with a plain background.</p>
      <div class="photo-row">
        <div class="photo">
          <img v-if="form.photo" :src="form.photo" alt="Your ID photo" />
          <span v-else>{{ initials(form.fullName) }}</span>
        </div>
        <div class="photo-actions">
          <label class="btn ghost small upload">
            {{ form.photo ? 'Change photo' : 'Upload photo' }}
            <input type="file" accept="image/*" hidden @change="pickPhoto" />
          </label>
          <button v-if="form.photo" type="button" class="btn danger small" @click="form.photo = ''">Remove</button>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2>Personal details</h2>
      <div class="grid">
        <div class="field wide"><label for="name">Full name</label><input id="name" v-model="form.fullName" class="input" /></div>
        <div class="field"><label for="idn">ID number</label><input id="idn" :value="user.idNumber" class="input" disabled /></div>
        <div class="field"><label for="bd">Birthdate</label><input id="bd" v-model="form.birthdate" type="date" class="input" /></div>
        <div class="field">
          <label for="sex">Sex</label>
          <select id="sex" v-model="form.sex" class="input"><option value="">Select</option><option>Female</option><option>Male</option></select>
        </div>
        <div class="field">
          <label for="bt">Blood type</label>
          <select id="bt" v-model="form.bloodType" class="input"><option value="">Select</option><option v-for="b in ['A+','A-','B+','B-','AB+','AB-','O+','O-']" :key="b">{{ b }}</option></select>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2>Academic</h2>
      <div class="grid">
        <div class="field wide">
          <label for="course">Program</label>
          <select id="course" v-model="form.course" class="input"><option value="">Select program</option><option v-for="c in COURSES" :key="c">{{ c }}</option></select>
        </div>
        <div class="field">
          <label for="yr">Year level</label>
          <select id="yr" v-model="form.yearLevel" class="input"><option value="">Select</option><option v-for="y in ['1','2','3','4']" :key="y" :value="y">Year {{ y }}</option></select>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2>Contact</h2>
      <div class="grid">
        <div class="field"><label for="cn">Contact number</label><input id="cn" v-model="form.contactNumber" class="input" inputmode="tel" placeholder="0917 123 4567" /></div>
        <div class="field"><label for="em">Email</label><input id="em" v-model="form.email" type="email" class="input" placeholder="name@cpsu.edu.ph" /></div>
        <div class="field full"><label for="ad">Home address</label><textarea id="ad" v-model="form.address" class="input" placeholder="Barangay, city, province" /></div>
      </div>
    </section>

    <section class="panel">
      <h2>Emergency contact</h2>
      <p class="sub">Shown on the back of your ID.</p>
      <div class="grid">
        <div class="field"><label for="gn">Name</label><input id="gn" v-model="form.guardianName" class="input" /></div>
        <div class="field"><label for="gc">Contact number</label><input id="gc" v-model="form.guardianContact" class="input" inputmode="tel" /></div>
      </div>
    </section>

    <div class="save"><button class="btn">Save changes</button></div>
  </form>
</template>

<style scoped>
.page { display: grid; gap: 18px; max-width: 900px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 16px; }
.wide, .full { grid-column: 1 / -1; }
.photo-row { display: flex; align-items: center; gap: 20px; margin-top: 16px; flex-wrap: wrap; }
.photo { width: 96px; height: 128px; border-radius: 14px; background: var(--mint); overflow: hidden; display: grid; place-items: center; font-weight: 800; font-size: 1.8rem; color: #9ccdb2; }
.photo img { width: 100%; height: 100%; object-fit: cover; }
.photo-actions { display: flex; gap: 10px; align-items: center; }
.upload { cursor: pointer; display: inline-block; }
.save { position: sticky; bottom: 0; padding: 14px 0; background: linear-gradient(transparent, var(--paper) 40%); display: flex; justify-content: flex-end; }
@media (max-width: 620px) { .grid { grid-template-columns: 1fr; } }
</style>
