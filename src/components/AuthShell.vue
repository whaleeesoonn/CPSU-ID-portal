<script setup>
import IdCard from './IdCard.vue'

const sample = {
  name: 'Angela Mae Villanueva',
  idNumber: '2026-0001',
  course: 'BS Information Technology',
  yearLevel: 3,
  photo: '',
  validUntil: '2027-07-31T00:00:00.000Z',
  emergencyName: 'Rosalie Villanueva',
  emergencyContact: '0918 765 4321',
}
</script>

<template>
  <main class="shell">
    <section class="form-side">
      <header class="school">
        <img src="/cpsu-logo.png" alt="CPSU seal" />
        <div>
          <strong>Central Philippines State University</strong>
          <span>San Carlos Campus</span>
        </div>
      </header>

      <div class="form-wrap">
        <h1>Digital ID Information Management System</h1>
        <slot />
      </div>

      <p class="foot">San Carlos Campus, Negros Occidental</p>
    </section>

    <aside class="showcase" aria-hidden="true">
      <div class="cards">
        <IdCard class="c1" :student="sample" side="back" :width="250" />
        <IdCard class="c2" :student="sample" side="front" :width="290" />
      </div>
      <p>Your campus ID, always with you.</p>
      <span>Keep your student information up to date and show a verified digital ID anywhere on campus.</span>
    </aside>
  </main>
</template>

<style scoped>
.shell { min-height: 100vh; width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); background: #fff; }
.form-side { display: flex; flex-direction: column; padding: clamp(20px, 3vw, 40px) clamp(20px, 5vw, 72px); }
.school { display: flex; gap: 14px; align-items: center; }
.school img { width: 52px; height: 52px; }
.school strong { display: block; font-size: 1rem; color: var(--g900); }
.school span { color: var(--muted); font-size: 0.9rem; }
.form-wrap { width: 100%; max-width: 440px; margin: auto; padding: 32px 0; }
h1 { font-size: clamp(1.45rem, 2.1vw, 1.8rem); line-height: 1.2; letter-spacing: -0.02em; font-weight: 800; color: var(--g900); margin-bottom: 26px; }
.foot { color: var(--muted); font-size: 0.82rem; }

.showcase {
  background: radial-gradient(120% 90% at 30% 10%, var(--g600), var(--g800) 60%, var(--g900));
  color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 32px; text-align: center; gap: 10px; overflow: hidden;
}
.cards { position: relative; width: 460px; height: 560px; margin-bottom: 30px; max-width: 100%; }
.c1 { position: absolute; left: 0; top: 40px; transform: rotate(-7deg); opacity: 0.95; }
.c2 { position: absolute; right: 0; top: 0; transform: rotate(4deg); }
.showcase p { font-size: clamp(1.4rem, 2vw, 1.9rem); font-weight: 800; letter-spacing: -0.02em; }
.showcase span { max-width: 38ch; color: #cfe9da; line-height: 1.55; }

@media (max-width: 920px) {
  .shell { grid-template-columns: 1fr; }
  .showcase { display: none; }
  .form-wrap { margin: 0 auto; }
}
</style>
