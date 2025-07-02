import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface GachaPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function Gacha({ isOpen, onClose }: GachaPopupProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [timeUntilNextPull, setTimeUntilNextPull] = useState(0)
  const [canPull, setCanPull] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showMiniPopup, setShowMiniPopup] = useState(false)

  const smiskiItems = [
    "Butterfly Smiski",
    "Cherry Blossom Smiski", 
    "Moon Smiski",
    "Star Smiski",
    "Flower Smiski",
    "Theater Smiski",
    "Circus Smiski",
    "Artist Smiski",
    "Music Smiski",
    "Lucky Smiski",
    "Forest Smiski",
    "Ocean Smiski",
    "Lantern Smiski",
    "Wind Smiski",
    "Sunrise Smiski"
  ]

  const slides = [
    {
      title: "Collection",
      content: "View your collected Smiski figures"
    },
    {
      title: "Rarity",
      content: "Check rarity statistics"
    },
    {
      title: "History",
      content: "Your pull history"
    }
  ]

  // Reset timer for testing
  useEffect(() => {
    localStorage.setItem('lastGachaPull', (Date.now() - 2 * 60 * 60 * 1000).toString());
    const checkPullAvailability = () => {
      const lastPullTime = localStorage.getItem('lastGachaPull')
      const now = Date.now()
      
      if (!lastPullTime) {
        setCanPull(true)
        setTimeUntilNextPull(0)
        return
      }

      const timeSinceLastPull = now - parseInt(lastPullTime)
      const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
      
      if (timeSinceLastPull >= oneHour) {
        setCanPull(true)
        setTimeUntilNextPull(0)
      } else {
        setCanPull(false)
        setTimeUntilNextPull(oneHour - timeSinceLastPull)
      }
    }

    checkPullAvailability()
    const interval = setInterval(checkPullAvailability, 1000) // Check every second

    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSpin = () => {
    if (!canPull) return
    
    setIsSpinning(true)
    setResult(null)
    
    // Save pull time
    localStorage.setItem('lastGachaPull', Date.now().toString())
    setCanPull(false)
    
    // Simulate spinning animation
    setTimeout(() => {
      const randomItem = smiskiItems[Math.floor(Math.random() * smiskiItems.length)]
      setResult(randomItem)
      setIsSpinning(false)
    }, 2000)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            fontFamily: "'Baloo 2', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif"
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              background: '#dae586',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '90vw',
              maxHeight: '85vh',
              width: '800px',
              height: '500px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              border: '3px solid #10b981',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
              }}
            >
              ×
            </button>

            {/* Title at top */}
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              color: '#fff',
              margin: '0 0 20px 0',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
              letterSpacing: '0.05em'
            }}>
              Smiski Gacha
            </h2>

            {/* Main content area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {!isSpinning && !result && canPull && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (canPull) {
                      handleSpin();
                      setShowMiniPopup(true);
                      setTimeout(() => setShowMiniPopup(false), 1500);
                    }
                  }}
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    background: canPull ? 'linear-gradient(45deg, #fef08a, #fbbf24)' : 'rgba(255, 255, 255, 0.3)',
                    color: canPull ? '#065f46' : '#fff',
                    border: 'none',
                    cursor: canPull ? 'pointer' : 'not-allowed',
                    boxShadow: canPull ? '0 8px 16px rgba(0, 0, 0, 0.2)' : 'none',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                    opacity: canPull ? 1 : 0.7,
                    transition: 'all 0.2s ease',
                    margin: '20px 0'
                  }}
                >
                  {canPull ? 'FREE PULL!' : `Next pull: ${formatTime(timeUntilNextPull)}`}
                </motion.button>
              )}

              {isSpinning && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                  style={{
                    fontSize: '3rem',
                    margin: '20px 0',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                >
                  SPINNING...
                </motion.div>
              )}

              {result && !isSpinning && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    padding: '24px',
                    margin: '20px 0',
                    border: '3px solid #fef08a',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#065f46',
                    margin: '0 0 8px 0'
                  }}>
                    You got:
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#10b981',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                  }}>
                    {result}
                  </div>
                </motion.div>
              )}

              {/* Sliding rectangles */}
              <div style={{
                position: 'relative',
                height: '220px',
                margin: '20px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Only one main rectangle, no arrows */}
                <motion.div
                  key={0}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '22px',
                    padding: '48px',
                    width: '480px',
                    height: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '2px solid #10b981'
                  }}
                >
                  <div style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: '#065f46',
                    margin: '0 0 8px 0'
                  }}>
                    Collection
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#10b981',
                    textAlign: 'center'
                  }}>
                    View your collected Smiski figures
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom section */}
            <div style={{ marginTop: 0, paddingTop: '8px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (canPull) {
                    handleSpin();
                  }
                }}
                disabled={!canPull}
                style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  padding: '8px 20px',
                  borderRadius: '10px',
                  background: canPull ? 'linear-gradient(45deg, #fef08a, #fbbf24)' : 'rgba(255, 255, 255, 0.3)',
                  color: canPull ? '#065f46' : '#fff',
                  border: 'none',
                  cursor: canPull ? 'pointer' : 'not-allowed',
                  boxShadow: canPull ? '0 4px 8px rgba(0, 0, 0, 0.12)' : 'none',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                  opacity: canPull ? 1 : 0.7,
                  transition: 'all 0.2s ease',
                  marginTop: '8px'
                }}
              >
                {canPull ? 'FREE PULL!' : `Next pull: ${formatTime(timeUntilNextPull)}`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showMiniPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          pointerEvents: 'none'
        }}>
          <div style={{
            background: '#fffbe8',
            color: '#222',
            borderRadius: '18px',
            padding: '32px 48px',
            fontSize: '1.5rem',
            fontWeight: 700,
            boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
            border: '2.5px solid #fef08a',
            pointerEvents: 'auto',
            textAlign: 'center'
          }}>
            You got a Smiski!
          </div>
        </div>
      )}
    </AnimatePresence>
  )
} 