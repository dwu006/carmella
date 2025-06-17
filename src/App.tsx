import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Box, Plane } from '@react-three/drei'
import { motion } from 'framer-motion'
import './App.css'

// Bubbles animation component
function Bubbles({ count = 64 }) {
  // Generate random bubble properties
  const bubbles = Array.from({ length: count }).map((_, i) => {
    const size = Math.random() * 40 + 36 // 36px to 76px
    // Half the bubbles on the left 40% of the screen
    const left = i < count / 2 ? Math.random() * 40 : 40 + Math.random() * 60
    const delay = Math.random() * 4 // seconds (more stagger)
    const duration = 6 + Math.random() * 6 // 6-12s (slower)
    const opacity = 0.38 + Math.random() * 0.32
    const color = [
      'rgba(255, 255, 255, 0.85)',
      'rgba(255, 182, 217, 0.75)',
      'rgba(161, 196, 253, 0.7)',
      'rgba(252, 182, 159, 0.7)',
      'rgba(252, 210, 244, 0.7)',
      'rgba(255, 255, 255, 0.95)'
    ][Math.floor(Math.random() * 6)]
    // Max height: rise much higher (e.g., -1100 to -1600px)
    const yEnd = -1100 - Math.random() * 500 // -1100 to -1600
    // Gentle horizontal movement: random amplitude and direction
    const xAmp = (Math.random() - 0.5) * 60 // -30 to 30 px
    return { size, left, delay, duration, opacity, color, yEnd, xAmp, key: i }
  })
  return (
    <>
      {bubbles.map(({ size, left, delay, duration, opacity, color, yEnd, xAmp, key }) => (
        <motion.div
          className="bubble"
          key={key}
          initial={false}
          animate={{
            y: [0, yEnd],
            x: [0, xAmp, 0],
            opacity: [0, opacity, 0],
          }}
          transition={{ delay, duration, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', times: [0, 0.5, 1] }}
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            background: color,
            opacity: 1,
            boxShadow: `0 0 32px 8px ${color}`,
          }}
        />
      ))}
    </>
  )
}

// Landing component with Enter button
function LandingScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="loading-screen">
      <Bubbles count={64} />
      <div className="floating-shape floating1" />
      <div className="floating-shape floating2" />
      <div className="floating-shape floating3" />
      <div className="loading-content">
        <motion.h1
          className="cafe-title"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
          transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 1.1, y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } }}
        >
          carmella's maid cafe
          <span className="bubbly-heart" role="img" aria-label="heart">🤍</span>
        </motion.h1>
        <button className="enter-btn" onClick={onEnter}>
          <span className="enter-btn-text">enter!</span>
        </button>
      </div>
      <div className="bubbly-footer">
        <span>i know this isn't much but hope you enjoyed and smiled!</span>
      </div>
    </div>
  )
}

// Loading animation component
function LoadingScreen() {
  const [dots, setDots] = useState('')
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="loading-screen">
      <Bubbles count={64} />
      <div className="floating-shape floating1" />
      <div className="floating-shape floating2" />
      <div className="floating-shape floating3" />
      <div className="loading-content">
        <p className="loading-text">loading{dots}</p>
      </div>
    </div>
  )
}

// 3D Maid Cafe Scene
function MaidCafeScene() {
  // Get current time to determine lighting
  const currentHour = new Date().getHours()
  const isDaytime = currentHour >= 6 && currentHour < 18
  
  return (
    <>
      {/* Solid Dark Gray Floor */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#2F2F2F" />
      </Plane>

      {/* Tables */}
      <group position={[-3, -1.5, 2]}>
        <Box args={[2, 0.1, 1]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color="#DEB887" />
        </Box>
        {/* Table legs */}
        <Box args={[0.1, 1, 0.1]} position={[-0.8, 0, -0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[0.8, 0, -0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[-0.8, 0, 0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[0.8, 0, 0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
      </group>

      {/* Another table */}
      <group position={[3, -1.5, 2]}>
        <Box args={[2, 0.1, 1]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color="#DEB887" />
        </Box>
        {/* Table legs */}
        <Box args={[0.1, 1, 0.1]} position={[-0.8, 0, -0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[0.8, 0, -0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[-0.8, 0, 0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[0.8, 0, 0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
      </group>

      {/* Counter */}
      <group position={[0, -1.5, -4]}>
        <Box args={[6, 1, 1.5]}>
          <meshStandardMaterial color="#CD853F" />
        </Box>
        <Box args={[5.5, 0.1, 1.3]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#F5DEB3" />
        </Box>
      </group>

      {/* Chairs */}
      <group position={[-3, -1.5, 0.5]}>
        <Box args={[0.8, 0.1, 0.8]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 0.8, 0.1]} position={[-0.3, 0, -0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 0.8, 0.1]} position={[0.3, 0, -0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 0.8, 0.1]} position={[-0.3, 0, 0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 0.8, 0.1]} position={[0.3, 0, 0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
      </group>

      <group position={[3, -1.5, 0.5]}>
        <Box args={[0.8, 0.1, 0.8]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 0.8, 0.1]} position={[-0.3, 0, -0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 0.8, 0.1]} position={[0.3, 0, -0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 0.8, 0.1]} position={[-0.3, 0, 0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Box args={[0.1, 0.8, 0.1]} position={[0.3, 0, 0.3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
      </group>

      {/* Welcome sign */}
      <Text
        position={[0, 1, -3.5]}
        fontSize={0.5}
        color="#FF1493"
        anchorX="center"
        anchorY="middle"
      >
        Welcome to Carmella's Maid Cafe!
      </Text>

      {/* Menu board */}
      <group position={[-4, 0, -3]}>
        <Box args={[1.5, 2, 0.1]}>
          <meshStandardMaterial color="#2F4F4F" />
        </Box>
        <Text
          position={[0, 0.5, 0.1]}
          fontSize={0.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          MENU
        </Text>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.15}
          color="#FFB6C1"
          anchorX="center"
          anchorY="middle"
        >
          Coffee - $5
        </Text>
        <Text
          position={[0, -0.3, 0.1]}
          fontSize={0.15}
          color="#FFB6C1"
          anchorX="center"
          anchorY="middle"
        >
          Tea - $4
        </Text>
        <Text
          position={[0, -0.6, 0.1]}
          fontSize={0.15}
          color="#FFB6C1"
          anchorX="center"
          anchorY="middle"
        >
          Cake - $8
        </Text>
      </group>

      {/* Dynamic Lighting based on time of day */}
      <ambientLight intensity={isDaytime ? 0.8 : 0.3} />
      <pointLight 
        position={[10, 10, 10]} 
        intensity={isDaytime ? 1.2 : 0.6}
        color={isDaytime ? "#ffffff" : "#ffd700"}
      />
      <pointLight 
        position={[-10, 10, -10]} 
        intensity={isDaytime ? 0.8 : 0.4}
        color={isDaytime ? "#ffffff" : "#ff6b35"}
      />
    </>
  )
}

function App() {
  const [screen, setScreen] = useState<'landing' | 'loading' | 'scene'>('landing')

  // Get current time to determine environment
  const currentHour = new Date().getHours()
  const isDaytime = currentHour >= 6 && currentHour < 18

  // When user clicks enter, show loading, then show scene
  const handleEnter = () => {
    setScreen('loading')
    setTimeout(() => setScreen('scene'), 2000)
  }

  return (
    <div className="app">
      {screen === 'landing' && <LandingScreen onEnter={handleEnter} />}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'scene' && (
        <div className="scene-container">
          <Canvas camera={{ position: [5, 5, 10], fov: 60 }}>
            <MaidCafeScene />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={20}
            />
            <Environment preset={isDaytime ? "sunset" : "night"} />
          </Canvas>
        </div>
      )}
    </div>
  )
}

export default App
