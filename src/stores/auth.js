import { reactive, computed } from 'vue'

const USERS_KEY = 'cpsu-dims.users'
const SESSION_KEY = 'cpsu-dims.session'
const LOCKS_KEY = 'cpsu-dims.locks'

export const MAX_ATTEMPTS = 5
export const LOCK_MINUTES = 5

export const COURSES = [
  'BS Information Technology',
  'BS Computer Science',
  'BS Education',
  'BS Agriculture',
  'BS Business Administration',
  'BS Criminology',
]

// Fields needed before the digital ID counts as complete.
export const REQUIRED = {
  photo: 'ID photo',
  course: 'Program',
  yearLevel: 'Year level',
  birthdate: 'Birthdate',
  contactNumber: 'Contact number',
  address: 'Home address',
  guardianName: 'Emergency contact name',
  guardianContact: 'Emergency contact number',
}

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

async function hash(text) {
  if (!globalThis.crypto?.subtle) return text
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const state = reactive({
  users: load(USERS_KEY, []),
  sessionId: load(SESSION_KEY, null),
  locks: load(LOCKS_KEY, {}), // { [idNumber]: { attempts, until } }
})

const saveUsers = () => localStorage.setItem(USERS_KEY, JSON.stringify(state.users))
const saveLocks = () => localStorage.setItem(LOCKS_KEY, JSON.stringify(state.locks))
const key = (id) => id.trim().toLowerCase()
const nextYear = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString()
}

const blankProfile = () => ({
  photo: '', course: '', yearLevel: '', birthdate: '', sex: '', contactNumber: '',
  email: '', address: '', guardianName: '', guardianContact: '', bloodType: '',
})

function addActivity(user, text) {
  user.activity.unshift({ text, at: new Date().toISOString() })
  user.activity.length = Math.min(user.activity.length, 15)
}

// Demo account, created once on first run.
const ready = (async () => {
  if (state.users.length) return
  state.users = [
    {
      idNumber: '2026-0001',
      fullName: 'Angela Mae Villanueva',
      password: await hash('demo1234'),
      validUntil: '2027-07-31T00:00:00.000Z',
      profile: {
        ...blankProfile(), course: 'BS Information Technology', yearLevel: '3', birthdate: '2004-03-18',
        sex: 'Female', contactNumber: '0917 123 4567', email: 'angela.villanueva@cpsu.edu.ph',
        address: 'Brgy. Punao, San Carlos City, Negros Occidental', guardianName: 'Rosalie Villanueva',
        guardianContact: '0918 765 4321', bloodType: 'O+',
      },
      requests: [],
      activity: [{ text: 'Account created', at: new Date().toISOString() }],
    },
  ]
  saveUsers()
})()

/** Password rule from the registration flowchart: letters and numbers only. */
export function checkPassword(pw) {
  if (pw.length < 6) return 'Password must be at least 6 characters.'
  if (!/^[A-Za-z0-9]+$/.test(pw)) return 'Password cannot contain special characters. Use letters and numbers only.'
  return ''
}

export const missingFields = (u) => Object.keys(REQUIRED).filter((k) => !u.profile[k])
export const completeness = (u) => Math.round(((Object.keys(REQUIRED).length - missingFields(u).length) / Object.keys(REQUIRED).length) * 100)
export function idStatus(u) {
  if (missingFields(u).length) return 'Incomplete'
  return Date.now() > new Date(u.validUntil).getTime() ? 'Expired' : 'Active'
}

export const auth = {
  user: computed(() => state.users.find((u) => u.idNumber === state.sessionId) ?? null),

  /** Registration flow: input -> ID number exists / password has special characters? -> try again, or save and go to login. */
  async register({ fullName, idNumber, password }) {
    await ready
    fullName = fullName.trim().replace(/\s+/g, ' ')
    idNumber = idNumber.trim()
    if (!fullName || !idNumber || !password) return { ok: false, field: 'form', message: 'Complete all fields to register.' }
    if (!/^[A-Za-z0-9-]{4,15}$/.test(idNumber)) {
      return { ok: false, field: 'idNumber', message: 'ID number must be 4–15 characters: letters, numbers, or hyphens.' }
    }
    if (state.users.some((u) => key(u.idNumber) === key(idNumber))) {
      return { ok: false, field: 'idNumber', message: 'This ID number already exists. Check it and try again.' }
    }
    const pwError = checkPassword(password)
    if (pwError) return { ok: false, field: 'password', message: pwError }
    state.users.push({
      idNumber, fullName, password: await hash(password), validUntil: nextYear(),
      profile: blankProfile(), requests: [],
      activity: [{ text: 'Account created', at: new Date().toISOString() }],
    })
    saveUsers()
    return { ok: true }
  },

  /** Seconds left on a lockout, or 0. */
  lockSeconds(idNumber, now = Date.now()) {
    const lock = state.locks[key(idNumber)]
    return lock?.until && lock.until > now ? Math.ceil((lock.until - now) / 1000) : 0
  },

  /** Login flow: attempts check -> input -> check credentials -> dashboard, or back to attempts. */
  async login({ idNumber, password }) {
    await ready
    if (!idNumber.trim() || !password) return { ok: false, message: 'Enter your ID number and password.' }
    const k = key(idNumber)
    if (this.lockSeconds(idNumber)) return { ok: false, locked: true }
    if (state.locks[k]?.until) delete state.locks[k] // lock expired, attempts reset

    const user = state.users.find((u) => key(u.idNumber) === k)
    if (user && user.password === (await hash(password))) {
      delete state.locks[k]
      saveLocks()
      state.sessionId = user.idNumber
      localStorage.setItem(SESSION_KEY, JSON.stringify(user.idNumber))
      addActivity(user, 'Logged in')
      saveUsers()
      return { ok: true }
    }

    const lock = (state.locks[k] ??= { attempts: 0, until: 0 })
    lock.attempts += 1
    if (lock.attempts >= MAX_ATTEMPTS) {
      lock.attempts = 0
      lock.until = Date.now() + LOCK_MINUTES * 60 * 1000
      saveLocks()
      return { ok: false, locked: true }
    }
    saveLocks()
    return { ok: false, message: 'Incorrect ID number or password.', left: MAX_ATTEMPTS - lock.attempts }
  },

  logout() {
    state.sessionId = null
    localStorage.removeItem(SESSION_KEY)
  },

  updateProfile(patch, { fullName } = {}) {
    const u = this.user.value
    Object.assign(u.profile, patch)
    if (fullName) u.fullName = fullName.trim()
    addActivity(u, 'Updated student information')
    saveUsers()
  },

  async changePassword(current, next) {
    const u = this.user.value
    if (u.password !== (await hash(current))) return { ok: false, message: 'Current password is incorrect.' }
    const err = checkPassword(next)
    if (err) return { ok: false, message: err }
    u.password = await hash(next)
    addActivity(u, 'Changed password')
    saveUsers()
    return { ok: true }
  },

  addRequest({ type, details }) {
    const u = this.user.value
    const n = u.requests.length + 1
    u.requests.unshift({ id: `REQ-${String(n).padStart(4, '0')}`, type, details, status: 'Pending', at: new Date().toISOString() })
    addActivity(u, `Submitted ${type.toLowerCase()} request`)
    saveUsers()
  },

  cancelRequest(id) {
    const u = this.user.value
    const r = u.requests.find((x) => x.id === id)
    if (!r || r.status !== 'Pending') return
    r.status = 'Cancelled'
    addActivity(u, `Cancelled request ${id}`)
    saveUsers()
  },
}
