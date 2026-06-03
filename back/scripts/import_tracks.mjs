/**
 * Import en masse de beats depuis le fichier Excel EUKS_Import_Beats.xlsx
 * (onglet "📝 Données") ou depuis un CSV de secours.
 *
 * Usage :
 *   node scripts/import_tracks.mjs <dossier_fichiers>
 *
 * Le script cherche automatiquement dans le dossier :
 *   1. Un fichier .xlsx  (priorité)
 *   2. Un fichier tracks.csv  (fallback)
 *
 * Structure attendue du dossier :
 *   beats-pote/
 *     EUKS_Import_Beats.xlsx   ← tableau rempli par le producteur
 *     covers/                  ← images (jpg, png, webp)
 *     mp3/                     ← previews MP3
 *     wav/                     ← masters WAV
 *     stems/                   ← ZIP des stems
 */

import fs from 'node:fs'
import path from 'node:path'
import ExcelJS from 'exceljs'

// ── Config ──────────────────────────────────────────────────────────────────

const FOLDER = process.argv[2]

if (!FOLDER) {
  console.error('Usage: node scripts/import_tracks.mjs <dossier_fichiers>')
  process.exit(1)
}

// Charge le .env du back
const envPath = new URL('../.env', import.meta.url).pathname
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/)
  if (match) process.env[match[1]] ??= match[2].trim()
}

const HOST     = process.env.HOST ?? 'localhost'
const PORT     = process.env.PORT ?? '3333'
const BASE_URL = `http://${HOST}:${PORT}/api/v1`
const EMAIL    = process.env.OWNER_EMAIL
const PASSWORD = process.env.OWNER_PASSWORD

if (!EMAIL || !PASSWORD) {
  console.error('OWNER_EMAIL / OWNER_PASSWORD manquants dans .env')
  process.exit(1)
}

// ── Lecture du fichier source (Excel prioritaire, CSV en fallback) ────────────

async function loadRows() {
  // Cherche un .xlsx dans le dossier
  const xlsxFile = fs.readdirSync(FOLDER).find(f => f.toLowerCase().endsWith('.xlsx'))

  if (xlsxFile) {
    const xlsxPath = path.join(FOLDER, xlsxFile)
    console.log(`📊 Fichier Excel détecté : ${xlsxFile}`)
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.readFile(xlsxPath)

    // Cherche l'onglet "Données" (accepte les variantes avec emoji)
    const ws = wb.worksheets.find(s => s.name.includes('Données') || s.name.includes('Donnees') || s.name.toLowerCase().includes('data'))
    if (!ws) throw new Error('Onglet "📝 Données" introuvable dans le fichier Excel.')

    // Les colonnes sont fixes et dans cet ordre dans l'Excel EUKS :
    // 1:title 2:bpm 3:key 4:moods 5:genres 6:cover 7:mp3 8:wav 9:stems
    const COL_KEYS = ['', 'title', 'bpm', 'key', 'moods', 'genres', 'cover', 'mp3', 'wav', 'stems']

    // Trouve la ligne d'en-tête : contient "Titre" ou "title" en col 1
    let headerRowNum = null
    ws.eachRow((row, rowNum) => {
      if (headerRowNum) return
      const cell1 = String(row.getCell(1).value ?? '').trim().toLowerCase()
      if (cell1.includes('titre') || cell1 === 'title') headerRowNum = rowNum
    })
    if (!headerRowNum) throw new Error('En-tête introuvable dans l\'onglet Données.')

    const rows = []
    ws.eachRow((row, rowNum) => {
      if (rowNum <= headerRowNum) return
      const title = String(row.getCell(1).value ?? '').trim()
      if (!title) return
      const obj = {}
      COL_KEYS.forEach((key, i) => { if (key) obj[key] = String(row.getCell(i).value ?? '').trim() })
      rows.push(obj)
    })
    return rows
  }

  // Fallback CSV
  const csvPath = path.join(FOLDER, 'tracks.csv')
  if (!fs.existsSync(csvPath)) throw new Error(`Aucun fichier .xlsx ni tracks.csv trouvé dans "${FOLDER}"`)
  console.log('📄 Fichier CSV détecté : tracks.csv')
  const content = fs.readFileSync(csvPath, 'utf8')
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).filter(Boolean).map(line => {
    const fields = []
    let cur = '', inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { fields.push(cur.trim()); cur = ''; continue }
      cur += ch
    }
    fields.push(cur.trim())
    return Object.fromEntries(headers.map((h, i) => [h, fields[i] ?? '']))
  }).filter(r => r.title)
}

function splitTags(str) {
  return str.split(/[|,]/).map(s => s.trim()).filter(Boolean)
}

function filePath(sub, name) {
  return path.join(FOLDER, sub, name)
}

function fileExists(p) {
  try { fs.accessSync(p); return true } catch { return false }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const body = await res.json()
  const token = body?.data?.token ?? body?.token
  if (!res.ok || !token) {
    throw new Error(`Login échoué : ${body?.message ?? res.status}`)
  }
  return token
}

// ── Catalogue distant ─────────────────────────────────────────────────────────

async function fetchCatalog(token) {
  const [keysRes, tagsRes, licRes] = await Promise.all([
    fetch(`${BASE_URL}/musical-keys`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${BASE_URL}/tags`,          { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${BASE_URL}/licenses`,      { headers: { Authorization: `Bearer ${token}` } }),
  ])
  const toArray = async r => { const b = await r.json(); return Array.isArray(b) ? b : (b?.data ?? []) }
  return {
    keys:     await toArray(keysRes),
    tags:     await toArray(tagsRes),
    licenses: (await toArray(licRes)).filter(l => l.isActive),
  }
}

// Retourne l'id du tag (existant ou créé à la volée)
async function ensureTag(name, type, catalog, token) {
  const existing = catalog.tags.find(
    t => t.name.toLowerCase() === name.toLowerCase() && t.type === type
  )
  if (existing) return existing.id

  const res = await fetch(`${BASE_URL}/tags`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type }),
  })
  const body = await res.json()
  const tag = body?.data ?? body
  if (!res.ok || !tag?.id) throw new Error(`Impossible de créer le tag "${name}" : ${body?.message ?? res.status}`)

  catalog.tags.push(tag) // mise en cache locale
  console.log(`    + Tag créé : [${type}] ${name}`)
  return tag.id
}

// ── Import d'un beat ──────────────────────────────────────────────────────────

async function importTrack(row, catalog, token, index, total) {
  const label = `[${index}/${total}] "${row.title}"`

  // Résolution tonalité
  const key = catalog.keys.find(k => k.name.toLowerCase() === (row.key ?? '').toLowerCase())
  if (!key) {
    console.warn(`  ⚠ ${label} — tonalité introuvable : "${row.key}" (ignoré)`)
    return false
  }

  // Résolution tags — créés automatiquement s'ils n'existent pas
  const moodNames  = splitTags(row.moods)
  const genreNames = splitTags(row.genres)
  const tagIds = []
  for (const name of moodNames) {
    try { tagIds.push(await ensureTag(name, 'mood', catalog, token)) }
    catch (e) { console.warn(`  ⚠ ${label} — mood "${name}" ignoré : ${e.message}`) }
  }
  for (const name of genreNames) {
    try { tagIds.push(await ensureTag(name, 'genre', catalog, token)) }
    catch (e) { console.warn(`  ⚠ ${label} — genre "${name}" ignoré : ${e.message}`) }
  }

  // Vérification fichiers
  const coverPath  = filePath('covers', row.cover)
  const mp3Path    = filePath('mp3',    row.mp3)
  const wavPath    = filePath('wav',    row.wav)
  const stemsPath  = filePath('stems',  row.stems)
  const missing = [
    ['cover', coverPath], ['mp3', mp3Path], ['wav', wavPath], ['stems', stemsPath],
  ].filter(([, p]) => !fileExists(p))
  if (missing.length) {
    console.warn(`  ✗ ${label} — fichiers manquants : ${missing.map(([n]) => n).join(', ')} (ignoré)`)
    return false
  }

  // FormData
  const form = new FormData()
  form.append('title',        row.title.trim())
  form.append('bpm',          String(Number(row.bpm) || 0))
  form.append('musicalKeyId', String(key.id))
  form.append('priceCents',   '0')
  form.append('isActive',     'true')
  tagIds.forEach(id => form.append('tagIds[]', String(id)))

  const toBlob = (p, type) => new Blob([fs.readFileSync(p)], { type })
  const ext = p => path.extname(p).slice(1).toLowerCase()

  form.append('cover',      toBlob(coverPath, 'image/' + (ext(coverPath) === 'jpg' ? 'jpeg' : ext(coverPath))), path.basename(coverPath))
  form.append('previewMp3', toBlob(mp3Path,   'audio/mpeg'),               path.basename(mp3Path))
  form.append('previewWav', toBlob(wavPath,   'audio/wav'),                path.basename(wavPath))
  form.append('stemsZip',   toBlob(stemsPath, 'application/zip'),          path.basename(stemsPath))

  // POST /tracks
  const createRes = await fetch(`${BASE_URL}/tracks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const createBody = await createRes.json()
  if (!createRes.ok) {
    console.error(`  ✗ ${label} — erreur création : ${createBody?.message ?? createRes.status}`)
    return false
  }
  const trackId = createBody?.data?.id ?? createBody?.id
  if (!trackId) {
    console.error(`  ✗ ${label} — pas d'id dans la réponse`)
    return false
  }

  // PUT /tracks/:id/licenses — attache toutes les licences actives
  const licPayload = { licenses: catalog.licenses.map(l => ({ licenseId: l.id, isActive: true })) }
  const licRes2 = await fetch(`${BASE_URL}/tracks/${trackId}/licenses`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(licPayload),
  })
  if (!licRes2.ok) {
    const lb = await licRes2.json()
    console.warn(`  ⚠ ${label} — licences non attachées : ${lb?.message ?? licRes2.status}`)
  }

  console.log(`  ✓ ${label} — importé (id ${trackId})`)
  return true
}

// ── Main ──────────────────────────────────────────────────────────────────────

let rows
try {
  rows = await loadRows()
} catch (e) {
  console.error('✗', e.message)
  process.exit(1)
}
const total = rows.length

console.log(`\n🎵 Import de ${total} beat(s)\n`)

let token
try {
  token = await login()
  console.log(`✓ Connecté en tant que ${EMAIL}\n`)
} catch (e) {
  console.error('✗ Impossible de se connecter :', e.message)
  process.exit(1)
}

const catalog = await fetchCatalog(token)
console.log(`Catalogue : ${catalog.keys.length} tonalités, ${catalog.tags.length} tags, ${catalog.licenses.length} licences actives\n`)

let ok = 0, ko = 0
for (let i = 0; i < rows.length; i++) {
  const success = await importTrack(rows[i], catalog, token, i + 1, total)
  success ? ok++ : ko++
}

console.log(`\n─────────────────────────────`)
console.log(`✅ Importés : ${ok}`)
if (ko) console.log(`❌ Ignorés  : ${ko}`)
console.log(`─────────────────────────────\n`)
