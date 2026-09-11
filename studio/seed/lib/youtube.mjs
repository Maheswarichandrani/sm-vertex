/**
 * The only place that talks to YouTube.
 *
 * Two rules shape this file. Everything from YouTube is untrusted text: ids are
 * validated against a strict pattern before they are ever put in a URL, and only
 * four scalar fields are lifted out of a response. And the request budget is
 * small on purpose — the watch page rate-limits hard (HTTP 429), so a search
 * result supplies the title and duration, and a lightweight oEmbed call is what
 * confirms the video may be embedded. The watch page is only a fallback.
 */

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

const HEADERS = {
  'accept-language': 'en-US,en;q=0.9',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
}

export const isVideoId = (id) => typeof id === 'string' && ID_PATTERN.test(id)

export const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetch with a timeout, retries, and a much longer wait after a 429.
 *
 * The timeout is load-bearing rather than defensive: without it a connection
 * that never answers parks a worker for the rest of the run.
 */
async function get(url, {attempts = 3, timeoutMs = 20000, method = 'GET'} = {}) {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: HEADERS,
        signal: AbortSignal.timeout(timeoutMs),
      })

      if (response.status === 429) {
        lastError = new Error('HTTP 429')
        if (attempt < attempts) await sleep(4000 * attempt)
        continue
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response
    } catch (error) {
      lastError = error
      if (attempt < attempts) await sleep(600 * attempt)
    }
  }

  throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? 'unknown error'}`)
}

const getText = async (url, options) => (await get(url, options)).text()

/**
 * Pull one embedded JSON object out of a page by brace matching.
 *
 * A regex cannot do this — the object contains nested braces and braces inside
 * strings — so this walks the text tracking string and escape state.
 */
function extractJsonObject(html, marker) {
  const markerAt = html.indexOf(marker)
  if (markerAt === -1) return null

  const start = html.indexOf('{', markerAt + marker.length - 1)
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < html.length; i++) {
    const char = html[i]

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }

    if (char === '"') inString = true
    else if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1))
        } catch {
          return null
        }
      }
    }
  }

  return null
}

/** "1:01:45" → 3705. Returns null for a live badge or anything unparseable. */
function parseDuration(text) {
  if (typeof text !== 'string') return null
  const parts = text.split(':').map((part) => Number.parseInt(part, 10))
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !Number.isInteger(part))) return null
  return parts.reduce((total, part) => total * 60 + part, 0)
}

/** Every videoRenderer in a search response, wherever it is nested. */
function collectVideoRenderers(node, found = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectVideoRenderers(item, found)
  } else if (node && typeof node === 'object') {
    if (node.videoRenderer) found.push(node.videoRenderer)
    for (const value of Object.values(node)) collectVideoRenderers(value, found)
  }
  return found
}

/**
 * Search results with the facts a lesson needs, from a single request.
 *
 * Title and duration come straight out of the result, so a candidate costs one
 * shared request rather than a watch-page fetch each.
 */
export async function searchVideos(query, {limit = 20} = {}) {
  const html = await getText(
    // sp=EgIQAQ%3D%3D restricts results to videos, keeping playlists and channels out.
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`,
  )

  const data = extractJsonObject(html, 'var ytInitialData =')
  const renderers = data ? collectVideoRenderers(data) : []

  const videos = []
  const seen = new Set()

  for (const renderer of renderers) {
    const id = renderer.videoId
    if (!isVideoId(id) || seen.has(id)) continue

    const lengthSeconds = parseDuration(renderer.lengthText?.simpleText)
    if (!lengthSeconds) continue // no duration badge means live or a short

    seen.add(id)
    videos.push({
      id,
      title: renderer.title?.runs?.[0]?.text ?? renderer.title?.simpleText ?? '',
      author: renderer.ownerText?.runs?.[0]?.text ?? renderer.longBylineText?.runs?.[0]?.text ?? '',
      lengthSeconds,
    })

    if (videos.length >= limit) break
  }

  return videos
}

/**
 * Whether the video may play in an embed on our own page.
 *
 * Playback stays on the site (AGENTS.md §7), so a video that refuses to embed is
 * not a usable lesson however well it matches the topic. oEmbed answers this
 * with a small JSON response instead of a megabyte of watch-page HTML.
 */
export async function isEmbeddable(id) {
  if (!isVideoId(id)) throw new Error(`Refusing to check a malformed video id: ${String(id)}`)

  try {
    await get(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl(id))}&format=json`,
      {attempts: 2, timeoutMs: 10000},
    )
    return true
  } catch {
    // 401 (embedding disabled) and 404 (removed or private) both land here.
    return false
  }
}

/**
 * The same facts read from the watch page.
 *
 * Only a fallback for a video the search result described incompletely — this
 * endpoint is the one that rate-limits.
 */
export async function fetchVideoMeta(id) {
  if (!isVideoId(id)) throw new Error(`Refusing to fetch a malformed video id: ${String(id)}`)

  const html = await getText(watchUrl(id))
  const details = extractJsonObject(html, '"videoDetails":')
  if (!details || details.videoId !== id) return null

  const lengthSeconds = Number.parseInt(details.lengthSeconds, 10)
  if (!Number.isInteger(lengthSeconds) || lengthSeconds <= 0) return null

  return {
    id,
    title: typeof details.title === 'string' ? details.title : '',
    author: typeof details.author === 'string' ? details.author : '',
    lengthSeconds,
    embeddable: details.playableInEmbed === true || /"playableInEmbed":true/.test(html),
    isLive: details.isLiveContent === true || details.isLive === true,
  }
}

/** maxres does not exist for every video; hq always does. */
export async function thumbnailUrl(id) {
  if (!isVideoId(id)) throw new Error(`Refusing to build a thumbnail URL for: ${String(id)}`)

  const maxres = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
  try {
    await get(maxres, {method: 'HEAD', attempts: 1, timeoutMs: 10000})
    return maxres
  } catch {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  }
}

/** How well a candidate's own title matches the words we searched for. */
export function titleOverlap(query, title) {
  const stop = new Set(['tutorial', 'explained', 'the', 'a', 'an', 'and', 'for', 'to', 'in', 'of', 'with'])
  const words = (text) =>
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9+#]+/g, ' ')
        .split(' ')
        .filter((word) => word.length > 2 && !stop.has(word)),
    )

  const wanted = words(query)
  if (wanted.size === 0) return 0

  const got = words(title)
  let hits = 0
  for (const word of wanted) if (got.has(word)) hits++
  return hits / wanted.size
}
