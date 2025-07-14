import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface GachaPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function Gacha({ isOpen, onClose }: GachaPopupProps) {
  const [timeUntilNextPull, setTimeUntilNextPull] = useState(0)
  const [canPull, setCanPull] = useState(true)
  const [showGachaAnimation, setShowGachaAnimation] = useState(false)
  const [carouselPosition, setCarouselPosition] = useState(0)
  const [winningSmiski, setWinningSmiski] = useState<number | null>(null)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [finalPosition, setFinalPosition] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

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

  // Calculate random animation duration (6-10 seconds) - fresh each time
  const getAnimationDuration = () => Math.random() * 4 + 6

  const handlePull = () => {
    if (!canPull || isAnimating) return;
    
    // Reset animation state
    setAnimationComplete(false)
    setIsAnimating(true)
    setShowGachaAnimation(true)
    
    // Randomly select winning smiski (1.1 to 1.9)
    const smiskis = [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9]
    const randomWinningSmiski = smiskis[Math.floor(Math.random() * smiskis.length)]
    setWinningSmiski(randomWinningSmiski)
    
    // Calculate final position to center the winning smiski
    const smiskiWidth = 300 // width of each smiski
    const gap = 30 // gap between smiskis
    const totalWidth = smiskiWidth + gap
    const winningIndex = smiskis.indexOf(randomWinningSmiski)
    
    // Calculate how many full sets to scroll through (2-3 sets for randomness)
    const baseSets = 2 + Math.floor(Math.random() * 2) // 2-3 sets
    const finalOffset = (baseSets * smiskis.length + winningIndex) * totalWidth
    
    // Center the winning smiski in the viewport
    const viewportCenter = window.innerWidth / 2
    const smiskiCenter = smiskiWidth / 2
    const finalPosition = viewportCenter - smiskiCenter - finalOffset
    
    setFinalPosition(finalPosition)
  }

  // Gacha Animation Component
  const GachaAnimation = () => {
    const smiskis = [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9]
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#dae586',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          fontFamily: "'Baloo 2', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif"
        }}
      >
        {/* Spotlight effect in the center */}
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          boxShadow: '0 0 50px rgba(255,255,255,0.4)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        {/* Smiski Carousel */}
        <div style={{
          width: '100%',
          height: '300px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          marginTop: '25px'
        }}>
          <motion.div
            animate={{
              x: [0, finalPosition]
            }}
            transition={{
              duration: getAnimationDuration(),
              ease: [0.25, 0.1, 0.25, 1],
              repeat: 0
            }}
            onAnimationComplete={() => {
              if (!animationComplete) {
                setAnimationComplete(true)
                setIsAnimating(false)
                // Auto-exit after 3 seconds
                setTimeout(() => {
                  setShowGachaAnimation(false)
                  // Save pull time
                  localStorage.setItem('lastGachaPull', Date.now().toString())
                }, 3000)
              }
            }}
            style={{
              display: 'flex',
              gap: '30px',
              alignItems: 'center'
            }}
          >
            {/* Duplicate smiskis for seamless loop */}
            {[...Array(4)].map((_, loopIndex) => (
              smiskis.map((smiskiNum, index) => (
                <motion.div
                  key={`${loopIndex}-${smiskiNum}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: animationComplete && smiskiNum === winningSmiski ? [1, 1.2, 1] : 1, 
                    opacity: 1 
                  }}
                  transition={{ 
                    duration: animationComplete && smiskiNum === winningSmiski ? 0.6 : 0.3,
                    delay: smiskiNum * 0.05,
                    scale: {
                      duration: 0.6,
                      repeat: animationComplete && smiskiNum === winningSmiski ? 2 : 0,
                      ease: "easeInOut"
                    }
                  }}
                  style={{
                    flexShrink: 0,
                    width: '300px',
                    height: '300px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <motion.img
                    src={`/smiskis/${smiskiNum}.png`}
                    alt={`Smiski ${smiskiNum}`}
                    style={{
                      width: '300px',
                      height: '300px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                    }}
                  />
                </motion.div>
              ))
            ))}
          </motion.div>
        </div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '75px',
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#fff',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
            textAlign: 'center'
          }}
        >
          {animationComplete ? '!' : 'SPINNING ...'}
        </motion.div>
      </motion.div>
    )
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
              padding: '16px 24px 24px 24px',
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
              marginTop: '8px',
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
              margin: '0 0 12px 0',
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
                height: '240px',
                margin: '0 0 10px 0',
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
                    backgroundImage: 'url(/smiskis/background.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '22px',
                    padding: '48px',
                    width: '600px',
                    height: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* Removed text content */}
                </motion.div>
              </div>
            </div>

            {/* Bottom section */}
            <div style={{ marginTop: 0, paddingTop: '0px', display: 'flex', justifyContent: 'center' }}>
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
                  marginTop: '0px'
                }}
              >
                {canPull ? 'FREE PULL!' : `Next pull: ${formatTime(timeUntilNextPull)}`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Gacha Animation Overlay */}
      <AnimatePresence>
        {showGachaAnimation && <GachaAnimation />}
      </AnimatePresence>
    </AnimatePresence>
  )
} 