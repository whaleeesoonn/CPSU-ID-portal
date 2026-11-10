import QRCode from 'qrcode'

/** Flat shape used by the ID card, built from a user account. */
export function cardData(u) {
  const p = u.profile
  return {
    name: u.fullName,
    idNumber: u.idNumber,
    course: p.course,
    yearLevel: p.yearLevel,
    photo: p.photo,
    validUntil: u.validUntil,
    emergencyName: p.guardianName,
    emergencyContact: p.guardianContact,
    address: p.address,
  }
}

export const qrText = (c) => `CPSU-SC|${c.idNumber}|${c.name}|valid-until:${c.validUntil.slice(0, 10)}`

export const makeQr = (text, width = 280) =>
  QRCode.toDataURL(text, { margin: 1, width, color: { dark: '#0b3d2a', light: '#ffffff' } })

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function fitText(ctx, text, maxWidth, size, weight = 800) {
  let s = size
  do {
    ctx.font = `${weight} ${s}px Manrope, system-ui, sans-serif`
    s -= 2
  } while (ctx.measureText(text).width > maxWidth && s > 14)
}

function wrap(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      line = w
      y += lineHeight
    } else line = test
  }
  if (line) ctx.fillText(line, x, y)
  return y + lineHeight
}

const W = 540
const H = 860
const GREEN = '#0f6b44'
const DARK = '#0b3d2a'

async function drawFront(ctx, c, logo) {
  ctx.save()
  roundRect(ctx, 0, 0, W, H, 36)
  ctx.clip()
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = GREEN
  ctx.fillRect(0, 0, W, 250)
  ctx.drawImage(logo, 36, 34, 92, 92)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.font = '800 25px Manrope, system-ui, sans-serif'
  ctx.fillText('CENTRAL PHILIPPINES', 146, 66)
  ctx.fillText('STATE UNIVERSITY', 146, 98)
  ctx.font = '600 20px Manrope, system-ui, sans-serif'
  ctx.fillText('San Carlos Campus', 146, 128)

  roundRect(ctx, 165, 150, 210, 262, 22)
  ctx.fillStyle = '#e6f4ec'
  ctx.fill()
  if (c.photo) {
    const ph = await loadImage(c.photo)
    ctx.save()
    roundRect(ctx, 165, 150, 210, 262, 22)
    ctx.clip()
    ctx.drawImage(ph, 165, 150, 210, 262)
    ctx.restore()
  } else {
    ctx.fillStyle = '#9ccdb2'
    ctx.font = '800 80px Manrope, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(c.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase(), 270, 300)
  }
  ctx.lineWidth = 8
  ctx.strokeStyle = '#fff'
  roundRect(ctx, 165, 150, 210, 262, 22)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = DARK
  fitText(ctx, c.name, 470, 36)
  ctx.fillText(c.name, W / 2, 476)
  ctx.fillStyle = '#4d7a65'
  ctx.font = '600 22px Manrope, system-ui, sans-serif'
  ctx.fillText(c.course || 'Program not set', W / 2, 516)
  ctx.fillText(c.yearLevel ? `Year ${c.yearLevel}` : 'Year level not set', W / 2, 548)

  ctx.fillStyle = GREEN
  ctx.font = '800 46px Manrope, system-ui, sans-serif'
  ctx.fillText(c.idNumber, W / 2, 640)
  ctx.fillStyle = '#4d7a65'
  ctx.font = '600 20px Manrope, system-ui, sans-serif'
  ctx.fillText('Student ID number', W / 2, 672)

  ctx.fillStyle = '#f2c811'
  ctx.fillRect(0, H - 70, W, 70)
  ctx.fillStyle = DARK
  ctx.font = '800 16px Manrope, system-ui, sans-serif'
  ctx.fillText('QUALITY EDUCATION • GLOBAL COMPETITIVENESS', W / 2, H - 28)
  ctx.restore()
}

async function drawBack(ctx, c) {
  ctx.save()
  roundRect(ctx, 0, 0, W, H, 36)
  ctx.clip()
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = GREEN
  ctx.fillRect(0, 0, W, 100)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.font = '800 28px Manrope, system-ui, sans-serif'
  ctx.fillText('Scan to verify this ID', W / 2, 62)

  const qr = await loadImage(await makeQr(qrText(c), 300))
  ctx.drawImage(qr, 120, 130, 300, 300)

  ctx.textAlign = 'left'
  const row = (label, value, y) => {
    ctx.fillStyle = '#4d7a65'
    ctx.font = '600 19px Manrope, system-ui, sans-serif'
    ctx.fillText(label, 48, y)
    ctx.fillStyle = DARK
    ctx.font = '700 23px Manrope, system-ui, sans-serif'
    return wrap(ctx, value || 'Not provided', 48, y + 30, W - 96, 28)
  }
  let y = 480
  y = row('Valid until', new Date(c.validUntil).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }), y)
  y = row('In case of emergency', [c.emergencyName, c.emergencyContact].filter(Boolean).join(' • '), y + 8)
  ctx.fillStyle = '#4d7a65'
  ctx.font = '600 18px Manrope, system-ui, sans-serif'
  wrap(ctx, 'If found, please return to CPSU San Carlos Campus, Negros Occidental.', 48, H - 130, W - 96, 26)
  ctx.fillStyle = '#f2c811'
  ctx.fillRect(0, H - 40, W, 40)
  ctx.restore()
}

/** Draws front and back side by side and downloads a PNG. */
export async function downloadIdPng(c) {
  if (document.fonts?.ready) await document.fonts.ready
  const gap = 60
  const pad = 40
  const canvas = document.createElement('canvas')
  canvas.width = W * 2 + gap + pad * 2
  canvas.height = H + pad * 2
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#f4faf6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const logo = await loadImage('/cpsu-logo.png')
  ctx.save()
  ctx.translate(pad, pad)
  await drawFront(ctx, c, logo)
  ctx.restore()
  ctx.save()
  ctx.translate(pad + W + gap, pad)
  await drawBack(ctx, c)
  ctx.restore()
  const a = document.createElement('a')
  a.download = `CPSU-ID-${c.idNumber}.png`
  a.href = canvas.toDataURL('image/png')
  a.click()
}
