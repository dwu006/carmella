import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface GachaPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function Gacha({ isOpen, onClose }: GachaPopupProps) {
  const [timeUntilNextPull, setTimeUntilNextPull] = useState(0)
  const [canPull, setCanPull] = useState(true)

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

  const handlePull = () => {
    if (!canPull) return;
    localStorage.setItem('lastGachaPull', Date.now().toString());
    setCanPull(false);
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
              padding: '24px', // reduced padding
              maxWidth: '90vw',
              maxHeight: '85vh',
              width: '800px',
              height: '500px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              justifyContent: 'flex-start',
              marginTop: '24px', // move popup up
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.25 }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '14px',
                background: 'none',
                border: 'none',
                fontSize: '38px',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                outline: 'none',
                boxShadow: 'none',
                padding: 0,
                lineHeight: 1,
                zIndex: 2
              }}
              onClick={onClose}
            >
              ×
            </motion.button>
            {/* Title at top */}
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              color: '#fff',
              margin: '16px 0 40px 0', // more space above, more below
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
              letterSpacing: '0.05em'
            }}>
              Smiski Gacha
            </h2>

            {/* Main content area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Sliding rectangles */}
              <div style={{
                position: 'relative',
                height: '280px', // expanded height
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
                    width: '600px', // expanded width
                    height: '320px', // expanded height
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
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
                onClick={handlePull}
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
    </AnimatePresence>
  )
} 