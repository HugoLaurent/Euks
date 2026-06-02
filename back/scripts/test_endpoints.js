async function wait(ms){return new Promise(r=>setTimeout(r,ms))}

async function fetchJson(url, opts={}){
  try{
    const res = await fetch(url, opts)
    const text = await res.text()
    let json
    try{ json = JSON.parse(text) }catch{ json = text }
    return { ok: res.ok, status: res.status, body: json }
  }catch(err){
    return { ok: false, error: String(err) }
  }
}

async function waitForServer(base){
  for(let i=0;i<60;i++){
    const r = await fetchJson(`${base}/api/v1/tags`)
    if(r.ok) return true
    await wait(1000)
    process.stdout.write('.')
  }
  return false
}

(async()=>{
  const base = 'http://localhost:3333'
  console.log('Waiting for backend...', base)
  const ready = await waitForServer(base)
  if(!ready){
    console.error('\nServer did not respond in time')
    process.exit(2)
  }
  console.log('\nServer ready — running tests')

  // GET tags
  const tags = await fetchJson(`${base}/api/v1/tags`)
  console.log('GET /tags', tags.status, tags.ok)

  // GET tracks (first page)
  const tracks = await fetchJson(`${base}/api/v1/tracks?page=1&perPage=5`)
  console.log('GET /tracks', tracks.status, Array.isArray(tracks.body) ? `items:${tracks.body.length}` : typeof tracks.body)

  // Try login with dev credentials
  const login = await fetchJson(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@euks.local', password: 'Admin12345!' })
  })
  console.log('POST /auth/login', login.status)

  let token = null
  if(login.ok){
    const data = login.body?.data || login.body
    token = data?.token || null
    console.log('Got token:', !!token)
  } else {
    console.log('Login response body:', login.body)
  }

  if(token){
    // Create a temporary tag
    const create = await fetchJson(`${base}/api/v1/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'test-from-script', type: 'mood' })
    })
    console.log('POST /tags', create.status, create.body?.id ? `id:${create.body.id}` : '')

    const createdId = create.body?.id || create.body?.data?.id
    if(createdId){
      const del = await fetchJson(`${base}/api/v1/tags/${createdId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      console.log('DELETE /tags/:id', del.status)
    } else {
      console.log('Could not determine created tag id')
    }

    // Try creating a minimal track (multipart) - will likely require file uploads; skip if not supported
    console.log('Skipping multipart track creation in automated script (requires files)')
  }

  console.log('Tests finished')
  process.exit(0)
})()
