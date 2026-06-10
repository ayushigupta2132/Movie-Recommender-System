const BASE = '/api'

async function get(url) {
  const response = await fetch(url)

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (body.detail) message = body.detail
    } catch {
      // Response wasn't JSON — use status-based message
    }
    throw new Error(message)
  }

  return response.json()
}

export async function searchMovies(query) {
  return get(`${BASE}/search?q=${encodeURIComponent(query)}`)
}

export async function getRecommendations(title, n = 5) {
  return get(`${BASE}/recommend?title=${encodeURIComponent(title)}&n=${n}`)
}

export async function healthCheck() {
  return get(`${BASE}/health`)
}