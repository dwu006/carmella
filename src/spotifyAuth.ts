const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'dd5825ff10c94146a8abba6d5fe18613'
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '6e8740684f9b4c2285f193bfc505ef63'
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback'
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-library-modify',
].join(' ')

export function getSpotifyAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'true',
  })
  return `${AUTH_ENDPOINT}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string) {
  console.log('exchangeCodeForToken: Starting token exchange...')
  console.log('Redirect URI being used:', REDIRECT_URI)
  
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })

  console.log('Token exchange request body:', Object.fromEntries(body.entries()))

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Token exchange failed:', res.status, res.statusText, errorText)
    throw new Error(`Failed to exchange code for token: ${res.status} ${res.statusText} - ${errorText}`)
  }

  const data = await res.json()
  console.log('Token exchange successful!')
  saveTokens(data)
  return data
}

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Failed to refresh token')
  const data = await res.json()
  saveTokens(data)
  return data
}

export function saveTokens(data: any) {
  if (data.access_token) {
    localStorage.setItem('spotify_access_token', data.access_token)
    localStorage.setItem('spotify_token_expires', (Date.now() + (data.expires_in || 3600) * 1000).toString())
  }
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token)
  }
}

export function getStoredAccessToken() {
  const token = localStorage.getItem('spotify_access_token')
  const expires = localStorage.getItem('spotify_token_expires')
  if (!token || !expires) return null
  if (Date.now() > parseInt(expires)) return null
  return token
}

export function getStoredRefreshToken() {
  return localStorage.getItem('spotify_refresh_token')
}

export function clearSpotifyTokens() {
  localStorage.removeItem('spotify_access_token')
  localStorage.removeItem('spotify_token_expires')
  localStorage.removeItem('spotify_refresh_token')
} 