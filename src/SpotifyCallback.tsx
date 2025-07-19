import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForToken } from './spotifyAuth'

export default function SpotifyCallback() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return

    console.log('SpotifyCallback: Processing callback...')
    console.log('Current URL:', window.location.href)
    
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    if (error) {
      console.error('Spotify auth error:', error)
      setError(`Spotify authentication error: ${error}`)
      return
    }

    if (!code) {
      console.error('No authorization code found in URL')
      setError('No authorization code found in URL')
      return
    }

    console.log('SpotifyCallback: Found authorization code, exchanging for token...')
    hasFetched.current = true
    
    exchangeCodeForToken(code)
      .then(() => {
        console.log('SpotifyCallback: Token exchange successful, redirecting to cafe...')
        navigate('/cafe', { replace: true })
      })
      .catch((err) => {
        console.error('SpotifyCallback: Token exchange failed:', err)
        setError(`Failed to authenticate with Spotify: ${err.message}`)
      })
  }, [navigate])

  if (error) return <div style={{ color: 'red', fontSize: '1.5rem', padding: 40 }}>{error}</div>
  return <div style={{ fontSize: '1.5rem', padding: 40 }}>Authenticating with Spotify...</div>
} 