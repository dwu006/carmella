import { useEffect, useRef, useState } from 'react'
import { getStoredAccessToken, refreshAccessToken, getStoredRefreshToken } from './spotifyAuth'

const SPOTIFY_PLAYER_NAME = 'test world'
const PLAYLIST_URI = 'spotify:playlist:1wIPIWEczaHenUcVz7zoIX'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: (() => void) | null;
    Spotify: any;
  }
}

export default function SpotifyPlayer() {
  const [player, setPlayer] = useState<any>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [track, setTrack] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  // Load and refresh token logic
  useEffect(() => {
    let token = getStoredAccessToken()
    if (!token) {
      const refresh = getStoredRefreshToken()
      if (refresh) {
        refreshAccessToken(refresh).then(data => {
          setAccessToken(data.access_token)
        }).catch(() => setError('Failed to refresh token'))
      } else {
        setError('No Spotify token found. Please log in.')
      }
    } else {
      setAccessToken(token)
    }
  }, [])

  // Load Spotify SDK
  useEffect(() => {
    if (!accessToken) return
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: SPOTIFY_PLAYER_NAME,
        getOAuthToken: (cb: (token: string) => void) => { cb(accessToken) },
        volume: 0.5
      })
      setPlayer(player)
      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id)
        setIsReady(true)
      })
      player.addListener('not_ready', () => setIsReady(false))
      player.addListener('player_state_changed', (state: any) => {
        setIsPlaying(!!state && !state.paused)
        if (state && state.track_window && state.track_window.current_track) {
          setTrack(state.track_window.current_track)
          setProgress(state.position)
          setDuration(state.duration)
        }
      })
      player.addListener('initialization_error', ({ message }: { message: string }) => setError(message))
      player.addListener('authentication_error', ({ message }: { message: string }) => setError(message))
      player.addListener('account_error', ({ message }: { message: string }) => setError(message))
      player.connect()
    }
    return () => {
      window.onSpotifyWebPlaybackSDKReady = null
      script.remove()
      if (player) player.disconnect()
    }
  }, [accessToken])

  // Play playlist
  const playPlaylist = async () => {
    if (!accessToken || !deviceId) return
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ context_uri: PLAYLIST_URI }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  // Playback controls
  const handlePlayPause = () => {
    if (!player) return
    player.togglePlay()
  }
  const handleNext = () => {
    if (!player) return
    player.nextTrack()
  }
  const handlePrev = () => {
    if (!player) return
    player.previousTrack()
  }

  // Progress bar update
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setProgress(prev => (prev + 1000 > duration ? duration : prev + 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  // Format ms to mm:ss
  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000)
    const sec = Math.floor((ms % 60000) / 1000)
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  // Music info overlay (top left)
  const musicInfo = isPlaying && track && (
    <div style={{
      position: 'fixed',
      top: 24,
      left: 24,
      zIndex: 9999,
      background: 'rgba(30,30,30,0.92)',
      borderRadius: 18,
      boxShadow: '0 4px 24px #0006',
      padding: '1.2em 2em 1.2em 1.2em',
      minWidth: 320,
      maxWidth: 400,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      fontFamily: 'Baloo 2, Comic Neue, Comic Sans MS, cursive',
      animation: 'fadeIn 0.5s',
    }}>
      <img src={track.album.images[0]?.url} alt="cover" style={{ width: 56, height: 56, borderRadius: 12, boxShadow: '0 2px 8px #0008' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 2 }}>{track.name}</div>
        <div style={{ fontSize: '0.98em', opacity: 0.85 }}>{track.artists.map((a: any) => a.name).join(', ')}</div>
        <div style={{ marginTop: 8, marginBottom: 2 }}>
          <div style={{ height: 6, background: '#444', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${(progress / duration) * 100}%`, height: '100%', background: '#1db954', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginTop: 2 }}>
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }} title="Previous">⏮️</button>
          <button onClick={handlePlayPause} style={{ background: '#1db954', border: 'none', color: '#fff', fontSize: 22, borderRadius: 8, width: 38, height: 38, cursor: 'pointer', boxShadow: '0 2px 8px #0004' }} title={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? '⏸️' : '▶️'}</button>
          <button onClick={handleNext} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }} title="Next">⏭️</button>
        </div>
      </div>
    </div>
  )

  if (error) return <div style={{ color: 'red', fontSize: '1.2rem' }}>{error}</div>
  if (!isReady) return <div style={{ fontSize: '1.2rem' }}>Loading Spotify Player...</div>

  return (
    <>
      <div style={{ fontFamily: 'Baloo 2, Comic Neue, Comic Sans MS, cursive', color: '#fff' }}>
        <button onClick={playPlaylist} style={{ fontSize: '1.2rem', padding: '0.7em 1.5em', borderRadius: 12, background: '#1db954', color: '#fff', border: 'none', marginBottom: 16 }}>
          Play Cafe Playlist
        </button>
        <div>Spotify Player Ready: {isReady ? 'Yes' : 'No'}</div>
        <div>Playback: {isPlaying ? 'Playing' : 'Paused'}</div>
      </div>
      {musicInfo}
    </>
  )
} 