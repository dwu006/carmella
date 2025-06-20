import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForToken } from './spotifyAuth'

export default function SpotifyCallback() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (!code) {
      setError('No code found in URL')
      return
    }
    exchangeCodeForToken(code)
      .then(() => {
        navigate('/', { replace: true })
      })
      .catch((err) => {
        setError('Failed to authenticate with Spotify')
      })
  }, [navigate])

  if (error) return <div style={{ color: 'red', fontSize: '1.5rem', padding: 40 }}>{error}</div>
  return <div style={{ fontSize: '1.5rem', padding: 40 }}>Authenticating with Spotify...</div>
} 