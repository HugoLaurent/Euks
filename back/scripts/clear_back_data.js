// Script to clear seed/mock data from the backend DB and remove mock assets.
// WARNING: Destructive. Keeps only the `users` table data.

import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

function parseDotEnv(filePath) {
  const env = {}
  if (!fs.existsSync(filePath)) return env
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    // remove optional surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

async function main() {
  const repoRoot = path.resolve('../') // running from back/scripts when executed by default in back
  const backDir = path.resolve('.')
  const envPath = path.join(backDir, '.env')
  const env = parseDotEnv(envPath)

  console.log('Loaded env from', envPath)

  const dbConnection = (env.DB_CONNECTION || 'pg').toLowerCase()
  if (dbConnection !== 'pg') {
    console.error('This script currently supports Postgres (DB_CONNECTION=pg). Aborting.')
    process.exit(2)
  }

  const client = new Client({
    host: env.DB_HOST || '127.0.0.1',
    port: Number(env.DB_PORT || 5432),
    user: env.DB_USER || process.env.USER || 'postgres',
    password: env.DB_PASSWORD || '',
    database: env.DB_DATABASE || 'postgres',
  })

  await client.connect()
  try {
    console.log('Connected to database', env.DB_DATABASE)

    // List of tables to truncate (preserve users table)
    const tables = [
      'auth_access_tokens',
      'track_tags',
      'track_licenses',
      'payment_orders',
      'tracks',
      'licenses',
      'tags',
      'musical_keys',
    ]

    console.log('About to TRUNCATE tables (in a single statement with CASCADE):', tables.join(', '))

    // Safety prompt: require explicit environment variable CONFIRM_CLEAR set to 'yes' in back/.env or process.env
    const confirm = env.CONFIRM_CLEAR || process.env.CONFIRM_CLEAR
    if (confirm !== 'yes') {
      console.log('\nSafety: You must set CONFIRM_CLEAR=yes in back/.env to actually run this destructive script.')
      console.log('No changes made. To proceed, add CONFIRM_CLEAR=yes then re-run this script.\n')
      process.exit(0)
    }

    // Run truncate
    const truncateSql = `TRUNCATE TABLE ${tables.map((t) => '"' + t + '"').join(', ')} RESTART IDENTITY CASCADE;`
    console.log('Running:', truncateSql)
    await client.query(truncateSql)
    console.log('Database tables truncated.')

    // Remove mock assets
    const frontMusicDir = path.join(backDir, '..', 'front', 'src', 'assets', 'music')
    const publicAssetsDir = path.join(backDir, 'public', 'assets')
    const publicSeedAudio = path.join(backDir, 'public', 'seed', 'audio')

    function removeFilesInDir(dir) {
      if (!fs.existsSync(dir)) return
      const files = fs.readdirSync(dir)
      for (const file of files) {
        const full = path.join(dir, file)
        try {
          const stat = fs.statSync(full)
          if (stat.isDirectory()) {
            fs.rmSync(full, { recursive: true, force: true })
            console.log('Removed directory:', full)
          } else {
            fs.unlinkSync(full)
            console.log('Removed file:', full)
          }
        } catch (err) {
          console.error('Failed to remove', full, err.message)
        }
      }
    }

    console.log('\nRemoving mock audio from front and public folders (if present)')
    removeFilesInDir(frontMusicDir)
    removeFilesInDir(publicSeedAudio)

    // Also remove the specific preview file copied in public assets (best-effort)
    const previewBasename = 'Ph 88 7Am 130 bpm Bb min Euks-C4HkTyAW.mp3'
    const candidate = path.join(publicAssetsDir, previewBasename)
    if (fs.existsSync(candidate)) {
      try { fs.unlinkSync(candidate); console.log('Removed public asset:', candidate) } catch (e) { console.error('Could not remove', candidate, e.message) }
    }

    console.log('\nClear finished. Database truncated (except users). Mock assets removed where found.')
  } catch (error) {
    console.error('Error during clearing:', error.message || error)
  } finally {
    await client.end()
    process.exit(0)
  }
}

main()
