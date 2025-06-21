import { Canvas } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid, useGLTF } from '@react-three/drei'
import { useState, useEffect, useRef, Suspense } from 'react'
import { Points, Float32BufferAttribute, Group, Mesh } from 'three'
import './App.css'
import { getStoredAccessToken, getSpotifyAuthUrl } from './spotifyAuth'
import SpotifyPlayer from './SpotifyPlayer'

function getSkyGradient(hour: number) {
  // Early morning (5-7 AM) - Dawn
  if (hour >= 5 && hour < 7) {
    return 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 20%, #fecfef 40%, #87ceeb 60%, #98d8e8 80%, #f0f8ff 100%)'
  }
  // Morning (7-11 AM) - Morning sky
  else if (hour >= 7 && hour < 11) {
    return 'linear-gradient(135deg, #87ceeb 0%, #98d8e8 30%, #b8e6f0 60%, #e0f6ff 100%)'
  }
  // Midday (11 AM - 3 PM) - Bright day
  else if (hour >= 11 && hour < 15) {
    return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 30%, #87ceeb 60%, #e0f6ff 100%)'
  }
  // Afternoon (3-6 PM) - Afternoon sky
  else if (hour >= 15 && hour < 18) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #87ceeb 60%, #f093fb 100%)'
  }
  // Sunset (6-8 PM) - Golden hour
  else if (hour >= 18 && hour < 20) {
    return 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 20%, #ff7f50 40%, #ff1493 60%, #8a2be2 80%, #4b0082 100%)'
  }
  // Dusk (8-10 PM) - Twilight
  else if (hour >= 20 && hour < 22) {
    return 'linear-gradient(135deg, #2c3e50 0%, #3498db 20%, #9b59b6 40%, #8e44ad 60%, #2c3e50 80%, #34495e 100%)'
  }
  // Night (10 PM - 5 AM) - Night sky
  else {
    return 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #16213e 80%, #0c0c0c 100%)'
  }
}

function isNightTime(hour: number) {
  return hour >= 20 || hour < 6
}

function Stars3D({ count = 150 }) {
  const pointsRef = useRef<Points>(null)
  
  useEffect(() => {
    if (!pointsRef.current) return
    
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Create stars in a large sphere around the scene
      const radius = 100 + Math.random() * 50 // Distance from center
      const theta = Math.random() * Math.PI * 2 // Horizontal angle
      const phi = Math.random() * Math.PI * 0.7 + Math.PI * 0.15 // Vertical angle (mostly above horizon)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)     // x
      positions[i * 3 + 1] = radius * Math.cos(phi) + 20            // y (higher up)
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) // z
    }
    
    pointsRef.current.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  }, [count])

  useEffect(() => {
    const animate = () => {
      if (pointsRef.current) {
        // Gentle rotation for a slight twinkling effect
        pointsRef.current.rotation.y += 0.0002
        pointsRef.current.rotation.x += 0.0001
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        color="white"
        size={0.5}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
      />
    </points>
  )
}

function ShootingStar3D() {
  const meshRef = useRef<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showShootingStar = () => {
      if (!meshRef.current) return
      
      // Random starting position in the sky
      const startX = (Math.random() - 0.5) * 100
      const startY = 30 + Math.random() * 20
      const startZ = (Math.random() - 0.5) * 100
      
      meshRef.current.position.set(startX, startY, startZ)
      setIsVisible(true)
      
      // Animate the shooting star
      const startTime = Date.now()
      const duration = 2000 // 2 seconds
      
      const animate = () => {
        if (!meshRef.current) return
        
        const elapsed = Date.now() - startTime
        const progress = elapsed / duration
        
        if (progress >= 1) {
          setIsVisible(false)
          return
        }
        
        // Move diagonally down and across
        meshRef.current.position.x = startX + progress * 30
        meshRef.current.position.y = startY - progress * 15
        meshRef.current.position.z = startZ + progress * 20
        
        // Fade out
        if (meshRef.current.material) {
          meshRef.current.material.opacity = 1 - progress
        }
        
        requestAnimationFrame(animate)
      }
      
      animate()
    }

    // Show shooting star every 15-25 seconds randomly
    const interval = setInterval(() => {
      if (Math.random() < 0.7) { // 70% chance
        showShootingStar()
      }
    }, Math.random() * 10000 + 15000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshBasicMaterial
        color="white"
        transparent={true}
        opacity={1}
      />
      {/* Glowing trail effect */}
      <mesh position={[-2, 0, 0]} scale={[4, 0.2, 0.2]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial
          color="#87ceeb"
          transparent={true}
          opacity={0.6}
        />
      </mesh>
    </mesh>
  )
}

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 100,
      fontFamily: "'Baloo 2', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif",
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#fff',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
      letterSpacing: '0.05em'
    }}>
      {formatTime(time)}
    </div>
  )
}

function Model({ url, ...props }: { url: string, [key: string]: any }) {
  const group = useRef<Group>(null!)
  const { scene } = useGLTF(url)

  const handlePointerOver = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    console.log(`Hovering over ${url}`)
    document.body.style.cursor = 'pointer'
    group.current.traverse((child) => {
      if (child instanceof Mesh) {
        ;(child.material as any).emissive.set('yellow')
      }
    })
  }
  
  const handlePointerOut = () => {
    console.log(`Stopped hovering over ${url}`)
    document.body.style.cursor = 'default'
    group.current.traverse((child) => {
      if (child instanceof Mesh) {
        ;(child.material as any).emissive.set('black')
      }
    })
  }

  return (
    <primitive 
      ref={group}
      object={scene}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      {...props} 
    />
  )
}

function Arcade() {
  return <Model url="/models/arcade.glb" scale={0.2} position={[-3, 0, -2]} rotation={[0, Math.PI / 4, 0]} />
}

function Gacha() {
  return <Model url="/models/gacha.glb" scale={0.3} position={[3, 0, -2]} rotation={[0, -Math.PI / 4, 0]} />
}

function Music() {
  return <Model url="/models/music.glb" scale={0.5} position={[0, -0.5, 0]} />
}

function Scene({ isNight }: { isNight: boolean }) {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.6} />
      
      {/* Directional light */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
      />
      
      {/* Simple plane/ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e8d5c4" />
      </mesh>
      
      {/* Models */}
      <Suspense fallback={null}>
        <Music />
        <Arcade />
        <Gacha />
      </Suspense>
      
      {/* Static Stars */}
      {isNight && <Stars3D count={150} />}
      {isNight && <ShootingStar3D />}
      
      {/* Grid helper for reference */}
      <Grid 
        args={[20, 20]} 
        position={[0, -1.99, 0]}
        cellColor="#d4c4a8"
        sectionColor="#c4b49a"
      />
      
      {/* OrbitControls for camera movement */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0.1}
      />
    </>
  )
}

export default function Cafe() {
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const [spotifyToken, setSpotifyToken] = useState<string | null>(getStoredAccessToken())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours())
    }, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Listen for token changes (e.g., after login)
    const checkToken = () => setSpotifyToken(getStoredAccessToken())
    window.addEventListener('storage', checkToken)
    return () => window.removeEventListener('storage', checkToken)
  }, [])

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: getSkyGradient(currentHour),
      position: 'relative',
      transition: 'background 2s ease-in-out'
    }}>
      <Clock />
      <Suspense fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: 'white',
          fontFamily: "'Baloo 2', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif",
          fontSize: '2rem'
        }}>
          Loading 3D scene...
        </div>
      }>
        <Canvas
          camera={{ position: [-12, 8, -12], fov: 60 }}
          shadows
          style={{ width: '100%', height: '100%' }}
        >
          <Scene isNight={isNightTime(currentHour)} />
        </Canvas>
      </Suspense>
      {/* Spotify login or player */}
      <div style={{ position: 'absolute', left: 32, bottom: 32, zIndex: 100 }}>
        {!spotifyToken ? (
          <button
            onClick={() => { window.location.href = getSpotifyAuthUrl() }}
            style={{ fontSize: '1.2rem', padding: '0.7em 1.5em', borderRadius: 12, background: '#1db954', color: '#fff', border: 'none', boxShadow: '0 2px 8px #0002' }}
          >
            Login with Spotify
          </button>
        ) : (
          <SpotifyPlayer />
        )}
      </div>
    </div>
  )
} 