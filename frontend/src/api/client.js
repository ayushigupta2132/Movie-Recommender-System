// In development, Vite's proxy rewrites /api/* → http://127.0.0.1:8000/*
// In production (Vercel), VITE_API_URL is set to the Render backend URL.
// The trailing-slash strip prevents double-slash in URLs.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function get(url) {
  const response = await fetch(url)

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (body.detail) message = body.detail
    } catch {
      // Response wasn't JSON
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