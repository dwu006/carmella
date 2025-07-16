import { Canvas } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useState, useEffect, useRef, Suspense } from 'react'
import { Points, Float32BufferAttribute, Group, Mesh } from 'three'
import * as THREE from 'three'
import './App.css'
import { getStoredAccessToken, getSpotifyAuthUrl } from './spotifyAuth'
import SpotifyPlayer from './SpotifyPlayer'
import GachaPopup from './GachaPopup'
import Basketball from './Basketball'
import Photo from './Photo'

declare global {
  interface Window {
    triggerSpotifyPlaylist: () => void;
  }
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

function ShootingStar3D({ size = 0.3, brightness = 1 }: { size?: number, brightness?: number }) {
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
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial
        color="white"
        transparent={true}
        opacity={brightness}
      />
      {/* Glowing trail effect */}
      <mesh position={[-2, 0, 0]} scale={[4, 0.2, 0.2]}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial
          color="#87ceeb"
          transparent={true}
          opacity={0.6}
        />
      </mesh>
    </mesh>
  )
}

function Model({ url, onClick, ...props }: { url: string, onClick?: () => void, [key: string]: any }) {
  const group = useRef<Group>(null!)
  const { scene } = useGLTF(url)

  const handlePointerOver = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    console.log(`Hovering over ${url}`)
    document.body.style.cursor = 'pointer'
    if (url === '/models/gacha.glb') {
      group.current.traverse((child) => {
        if (child instanceof Mesh && child.material && 'emissive' in child.material) {
          (child.material as any).emissive.set('#ffff00') // bright yellow
          if ('emissiveIntensity' in child.material) {
            (child.material as any).emissiveIntensity = 2.5
          }
        }
      })
    }
  }
  
  const handlePointerOut = () => {
    console.log(`Stopped hovering over ${url}`)
    document.body.style.cursor = 'default'
    if (url === '/models/gacha.glb') {
      group.current.traverse((child) => {
        if (child instanceof Mesh && child.material && 'emissive' in child.material) {
          (child.material as any).emissive.set('black')
          if ('emissiveIntensity' in child.material) {
            (child.material as any).emissiveIntensity = 1
          }
        }
      })
    }
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (onClick) {
      onClick()
    }
  }

  return (
    <primitive 
      ref={group}
      object={scene}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      {...props} 
    />
  )
}

function Arcade({ onClick }: { onClick?: () => void }) {
  return <Model url="/models/arcade.glb" scale={0.2} position={[3.5, 0, -5]} rotation={[0, -Math.PI, 0]} onClick={onClick} />
}

function Gacha({ onClick }: { onClick?: () => void }) {
  const gachaRef = useRef<Group>(null)
  return <Model ref={gachaRef} url="/models/gacha.glb" scale={0.7} position={[-4, -2, -5.5 ]} rotation={[0, Math.PI, 0]} onClick={onClick} />
}

function Music({ spotifyToken, onStartMusic }: { spotifyToken: string | null, onStartMusic: () => void }) {
  const handleClick = () => {
    if (!spotifyToken) {
      // Not logged in - redirect to Spotify login
      window.location.href = getSpotifyAuthUrl()
    } else {
      // Logged in - start music
      onStartMusic()
    }
  }
  
  return <Model url="/models/music.glb" scale={0.9} position={[-6, 0, -2]} onClick={handleClick} />
}

function Photobooth({ onClick }: { onClick?: () => void }) {
  return <Model url="/models/photobooth.glb" scale={1.3} position={[-0.29, 0, -5.2]} rotation={[0, Math.PI / 2, 0]} onClick={onClick} />
}

function CafeModel() {
  return <Model url="/models/cafe.glb" scale={1.2} position={[0, -1.4, 1]} rotation={[0, 0, 0]} />
}

function Scene({ isNight, onGachaClick, onArcadeClick, onPhotoboothClick, spotifyToken, onStartMusic, controlsRef }: { 
  isNight: boolean, 
  onGachaClick?: () => void, 
  onArcadeClick?: () => void,
  onPhotoboothClick?: () => void,
  spotifyToken: string | null,
  onStartMusic: () => void,
  controlsRef: any
}) {
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
      {/* <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e8d5c4" />
      </mesh> */}
      
      <Suspense fallback={null}>
        <CafeModel />
        <Music spotifyToken={spotifyToken} onStartMusic={onStartMusic} />
        <Arcade onClick={onArcadeClick} />
        <Gacha onClick={onGachaClick} />
        <Photobooth onClick={onPhotoboothClick} />
      </Suspense>
      
      {/* More static stars */}
      {isNight && <Stars3D count={300} />}
      {/* More, brighter, larger shooting stars */}
      {isNight && Array.from({ length: 10 }).map((_, i) => <ShootingStar3D key={i} size={0.6} brightness={2} />)}
      
      {/* Grid helper for reference */}
      {/* <Grid 
        args={[20, 20]} 
        position={[0, -1.99, 0]}
        cellColor="#d4c4a8"
        sectionColor="#c4b49a"
      /> */}
      
      {/* OrbitControls for camera movement */}
      <OrbitControls 
        ref={controlsRef}
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
  const [spotifyToken, setSpotifyToken] = useState<string | null>(getStoredAccessToken())
  const [isGachaPopupOpen, setIsGachaPopupOpen] = useState(false)
  const [isBasketballOpen, setIsBasketballOpen] = useState(false)
  const controlsRef = useRef<any>(null)

  // New state for saving camera position/target
  const [savedCameraPosition, setSavedCameraPosition] = useState<THREE.Vector3 | null>(null)
  const [savedCameraTarget, setSavedCameraTarget] = useState<THREE.Vector3 | null>(null)

  const [isPhotoOpen, setIsPhotoOpen] = useState(false)
  const [isHelpPopupOpen, setIsHelpPopupOpen] = useState(false)
  const [isLetterPopupOpen, setIsLetterPopupOpen] = useState(false)

  console.log('Cafe component - isPhotoOpen:', isPhotoOpen);

  useEffect(() => {
    // Listen for token changes (e.g., after login)
    const checkToken = () => setSpotifyToken(getStoredAccessToken())
    window.addEventListener('storage', checkToken)
    return () => window.removeEventListener('storage', checkToken)
  }, [])

  const handleGachaClick = () => {
    // Save current camera state
    if (controlsRef.current) {
      setSavedCameraPosition(controlsRef.current.object.position.clone())
      setSavedCameraTarget(controlsRef.current.target.clone())
    }
    if (controlsRef.current) {
      const startPosition = controlsRef.current.object.position.clone()
      const startTarget = controlsRef.current.target.clone()
      // Use the new camera position and target
      const endPosition = new THREE.Vector3(-5.03, 0.96, -8.90)
      const endTarget = new THREE.Vector3(0.00, 0.00, 0.00)
      const duration = 2000
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        controlsRef.current.object.position.lerpVectors(startPosition, endPosition, easeProgress)
        controlsRef.current.target.lerpVectors(startTarget, endTarget, easeProgress)
        controlsRef.current.update()
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsGachaPopupOpen(true)
        }
      }
      animate()
    } else {
      setIsGachaPopupOpen(true)
    }
  }

  const handleArcadeClick = () => {
    // Save current camera state
    if (controlsRef.current) {
      setSavedCameraPosition(controlsRef.current.object.position.clone())
      setSavedCameraTarget(controlsRef.current.target.clone())
    }
    // First smoothly move camera to view the arcade from the front
    if (controlsRef.current) {
      const startPosition = controlsRef.current.object.position.clone()
      const startTarget = controlsRef.current.target.clone()
      const endPosition = new THREE.Vector3(3, 3, -12)
      const endTarget = new THREE.Vector3(3, 0.75, -5)
      const duration = 2000 // 2 seconds
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        controlsRef.current.object.position.lerpVectors(startPosition, endPosition, easeProgress)
        controlsRef.current.target.lerpVectors(startTarget, endTarget, easeProgress)
        controlsRef.current.object.rotation.y = Math.PI * easeProgress // Rotate camera 180 degrees
        controlsRef.current.update()
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsBasketballOpen(true)
        }
      }
      animate()
    }
  }

  // Restore camera when basketball popup closes
  const handleCloseBasketball = () => {
    if (controlsRef.current && savedCameraPosition && savedCameraTarget) {
      const startPosition = controlsRef.current.object.position.clone()
      const startTarget = controlsRef.current.target.clone()
      const endPosition = savedCameraPosition.clone()
      const endTarget = savedCameraTarget.clone()
      const duration = 2000
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        controlsRef.current.object.position.lerpVectors(startPosition, endPosition, easeProgress)
        controlsRef.current.target.lerpVectors(startTarget, endTarget, easeProgress)
        controlsRef.current.update()
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
    setIsBasketballOpen(false)
  }

  const handlePhotoboothClick = () => {
    console.log('Photobooth clicked!');
    // Save current camera state
    if (controlsRef.current) {
      setSavedCameraPosition(controlsRef.current.object.position.clone())
      setSavedCameraTarget(controlsRef.current.target.clone())
    }
    // Move camera to the logged position and target
    if (controlsRef.current) {
      const startPosition = controlsRef.current.object.position.clone()
      const startTarget = controlsRef.current.target.clone()
      const endPosition = new THREE.Vector3(-1.10, 0.5, -5.3)
      const endTarget = new THREE.Vector3(3.5, 0.75, -5.0)
      const duration = 2000 // 2 seconds
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        controlsRef.current.object.position.lerpVectors(startPosition, endPosition, easeProgress)
        controlsRef.current.target.lerpVectors(startTarget, endTarget, easeProgress)
        controlsRef.current.update()
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Animation complete
          console.log('Setting isPhotoOpen to true');
          setIsPhotoOpen(true)
          console.log('Front view of photobooth!')
        }
      }
      animate()
    } else {
      // Fallback if no camera controls
      console.log('No camera controls, opening directly');
      setIsPhotoOpen(true);
    }
  }

  // Restore camera when gacha popup closes
  const handleCloseGacha = () => {
    if (controlsRef.current && savedCameraPosition && savedCameraTarget) {
      const startPosition = controlsRef.current.object.position.clone()
      const startTarget = controlsRef.current.target.clone()
      const endPosition = savedCameraPosition.clone()
      const endTarget = savedCameraTarget.clone()
      const duration = 2000
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        controlsRef.current.object.position.lerpVectors(startPosition, endPosition, easeProgress)
        controlsRef.current.target.lerpVectors(startTarget, endTarget, easeProgress)
        controlsRef.current.update()
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
    setIsGachaPopupOpen(false)
  }

  // Restore camera when photobooth closes
  const handleClosePhotobooth = () => {
    if (controlsRef.current && savedCameraPosition && savedCameraTarget) {
      const startPosition = controlsRef.current.object.position.clone()
      const startTarget = controlsRef.current.target.clone()
      const endPosition = savedCameraPosition.clone()
      const endTarget = savedCameraTarget.clone()
      const duration = 2000
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        controlsRef.current.object.position.lerpVectors(startPosition, endPosition, easeProgress)
        controlsRef.current.target.lerpVectors(startTarget, endTarget, easeProgress)
        controlsRef.current.update()
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
    setIsPhotoOpen(false)
    // If you have a photobooth popup, close it here
    // setIsPhotoboothOpen(false)
  }

  const handleStartMusic = () => {
    // Trigger the Spotify playlist to start
    if (window.triggerSpotifyPlaylist) {
      window.triggerSpotifyPlaylist()
    } else {
      console.log('Spotify player not ready yet')
    }
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #16213e 80%, #0c0c0c 100%)',
      position: 'relative',
      transition: 'background 2s ease-in-out'
    }}>

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
          camera={{ position: [12, 8, 12], fov: 60 }}
          shadows
          style={{ width: '100%', height: '100%' }}
        >
          <Scene isNight={true} onGachaClick={handleGachaClick} onArcadeClick={handleArcadeClick} onPhotoboothClick={handlePhotoboothClick} spotifyToken={spotifyToken} onStartMusic={handleStartMusic} controlsRef={controlsRef} />
        </Canvas>
      </Suspense>
      {/* Spotify login or player */}
      <div style={{ position: 'absolute', left: 32, bottom: 32, zIndex: 100 }}>
        {!spotifyToken ? (
          <button
            onClick={() => { window.location.href = getSpotifyAuthUrl() }}
            style={{ 
              fontSize: '1.2rem', 
              padding: '0.7em 1.5em', 
              borderRadius: 12, 
              background: '#1db954', 
              color: '#fff', 
              border: 'none', 
              boxShadow: '0 2px 8px #0002',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em',
              cursor: 'pointer'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Login
          </button>
        ) : (
          <SpotifyPlayer />
        )}
      </div>
      
      <GachaPopup 
        isOpen={isGachaPopupOpen} 
        onClose={handleCloseGacha} 
      />
      
      <Basketball 
        isOpen={isBasketballOpen} 
        onClose={handleCloseBasketball} 
      />

      {/* Top right icons */}
      <div style={{ position: 'absolute', top: 32, right: 32, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Letter/Mail icon */}
        <div
          onClick={() => setIsLetterPopupOpen(true)}
          style={{
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            opacity: 0.8,
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        
        {/* Question mark icon */}
        <div
          onClick={() => setIsHelpPopupOpen(true)}
          style={{
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            opacity: 0.8,
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <circle cx="12" cy="17" r="0.5" fill="#fff"/>
          </svg>
        </div>
      </div>

      <div style={{ position: 'absolute', right: 32, bottom: 32, zIndex: 100 }}>
        <button
          onClick={() => {
            if (controlsRef.current) {
              const pos = controlsRef.current.object.position;
              const tgt = controlsRef.current.target;
              console.log('Current camera position:', pos.x, pos.y, pos.z);
              console.log('Current camera target:', tgt.x, tgt.y, tgt.z);
              alert(`Camera position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})\nTarget: (${tgt.x.toFixed(2)}, ${tgt.y.toFixed(2)}, ${tgt.z.toFixed(2)})`);
            }
          }}
          style={{
            fontSize: '1rem',
            padding: '0.5em 1em',
            borderRadius: 8,
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            boxShadow: '0 2px 8px #0002',
            cursor: 'pointer',
            marginLeft: 8
          }}
        >
          Log Camera View
        </button>
      </div>

      <Photo isOpen={isPhotoOpen} onClose={handleClosePhotobooth} />
      
      {/* Help Popup */}
      {isHelpPopupOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
          }}
          onClick={() => setIsHelpPopupOpen(false)}
        >
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: 32,
              maxWidth: 500,
              margin: 20,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              fontFamily: "'Baloo 2', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsHelpPopupOpen(false)}
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                background: 'none',
                border: 'none',
                fontSize: '32px',
                color: '#000',
                cursor: 'pointer',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.outline = 'none'}
              onMouseLeave={(e) => e.currentTarget.style.outline = 'none'}
              onFocus={(e) => e.currentTarget.style.outline = 'none'}
            >
              ×
            </button>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#333',
              margin: '0 0 24px 0',
              textAlign: 'center',
            }}>
              Welcome to Carmella's Cafe
            </h2>
            
            <div style={{
              fontSize: '1.1rem',
              color: '#555',
              lineHeight: 1.6,
              textAlign: 'left',
            }}>
                             <p style={{ margin: '16px 0' }}>
                 <strong>🎰 Gacha Machine:</strong> Pull for cute Smiski figures!
               </p>
               
               <p style={{ margin: '16px 0' }}>
                 <strong>🏀 Arcade Basketball:</strong> Test your aim!
               </p>
               
               <p style={{ margin: '16px 0' }}>
                 <strong>📸 Photo Booth:</strong> Take a 3-photo memory strip!
               </p>
               
               <p style={{ margin: '16px 0' }}>
                 <strong>🎵 Music Player:</strong> Connect your Spotify to play music while you explore the cafe.
               </p>
              
                             <p style={{ margin: '20px 0 0 0', fontSize: '1rem', fontStyle: 'italic', textAlign: 'center', color: '#777' }}>
                 Click around to explore and have fun!
               </p>
            </div>
                     </div>
         </div>
       )}
       
       {/* Letter Popup */}
       {isLetterPopupOpen && (
         <div 
           style={{
             position: 'fixed',
             top: 0,
             left: 0,
             width: '100vw',
             height: '100vh',
             background: 'rgba(0, 0, 0, 0.5)',
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             zIndex: 3000,
             overflow: 'auto',
           }}
           onClick={() => setIsLetterPopupOpen(false)}
         >
           <div 
             style={{
               background: 'rgba(255, 255, 255, 0.95)',
               backdropFilter: 'blur(10px)',
               borderRadius: 20,
               padding: 32,
               maxWidth: 600,
               margin: 20,
               boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               position: 'relative',
               fontFamily: "'Baloo 2', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif",
             }}
             onClick={(e) => e.stopPropagation()}
           >
             {/* Close button */}
             <button
               onClick={() => setIsLetterPopupOpen(false)}
               style={{
                 position: 'absolute',
                 top: 5,
                 right: 5,
                 background: 'none',
                 border: 'none',
                 fontSize: '32px',
                 color: '#000',
                 cursor: 'pointer',
                 width: 40,
                 height: 40,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 outline: 'none',
               }}
             >
               ×
             </button>
             
             <div style={{
               fontSize: '1.1rem',
               color: '#000',
               lineHeight: 1.8,
               textAlign: 'left',
             }}>
               <p style={{ margin: '0 0 20px 0', fontWeight: 600, color: '#000' }}>
                 dear carmella,
               </p>
               
               <p style={{ margin: '0 0 16px 0' }}>
                 i never realized that my message came off as a rejection (my friends flamed me for not realizing) and i never meant it to be one. honestly i was scared and didn't know what to do as i never had those sort of feelings for a girl.
               </p>
               
               <p style={{ margin: '0 0 16px 0' }}>
                 i know you aren't interested anymore and exploring others, but i want you to know i only have eyes for you. you are the only girl i want and if i have to wait, i will wait because you are worth it.
               </p>
               
               <p style={{ margin: '0 0 20px 0' }}>
                 anyways i hope you like this gift!
               </p>
               
               <p style={{ margin: '0', fontWeight: 600, color: '#000', textAlign: 'right' }}>
                 with love,<br/>
                 daniel :)
               </p>
             </div>
           </div>
         </div>
       )}
    </div>
  )
} 