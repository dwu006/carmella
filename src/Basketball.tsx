import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface BasketballProps {
  isOpen: boolean
  onClose: () => void
}

export default function Basketball({ isOpen, onClose }: BasketballProps) {
  const [showInstructions, setShowInstructions] = useState(true)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShooting, setIsShooting] = useState(false)
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 })
  const [shots, setShots] = useState(0)
  const [maxShots] = useState(10)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isPlaying, timeLeft])

  const handlePlay = () => {
    setShowInstructions(false)
    setIsPlaying(true)
    setTimeLeft(30)
    setScore(0)
    setShots(0)
  }

  const handleShoot = (e: React.MouseEvent) => {
    if (!isPlaying || isShooting || shots >= maxShots || !gameAreaRef.current) return
    
    setIsShooting(true)
    setShots(prev => prev + 1)
    
    const rect = gameAreaRef.current.getBoundingClientRect()
    const ballStartX = rect.width / 2 // Center of game area
    const ballStartY = rect.height * 0.8 // Bottom area where ball starts
    
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    
    // Calculate direction from ball to click
    const deltaX = clickX - ballStartX
    const deltaY = ballStartY - clickY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // Normalize direction
    const directionX = deltaX / distance
    const directionY = deltaY / distance
    
    // Calculate power based on distance (closer = less power, further = more power)
    const maxDistance = Math.sqrt(ballStartX * ballStartX + ballStartY * ballStartY)
    const power = Math.min(distance / maxDistance * 1.5, 1.2) // Slightly more power for better gameplay
    
    // Animate ball along the calculated trajectory
    let progress = 0
    const animate = () => {
      if (progress < 1) {
        progress += 0.03 // Slower animation for better visibility
        
        // Calculate position with arc motion
        const x = ballStartX + directionX * power * 300 * progress
        const y = ballStartY - directionY * power * 300 * progress - 100 * Math.sin(progress * Math.PI) // Arc motion
        
        setBallPosition({ x, y })
        requestAnimationFrame(animate)
      } else {
        // Check if ball went through hoop
        const finalX = ballStartX + directionX * power * 300
        const finalY = ballStartY - directionY * power * 300
        const hoopCenterX = rect.width / 2
        const hoopCenterY = 80 // Top area where hoop is
        
        const distanceFromHoop = Math.sqrt(
          Math.pow(finalX - hoopCenterX, 2) + 
          Math.pow(finalY - hoopCenterY, 2)
        )
        
        if (distanceFromHoop < 30 && finalY > 60) { // Ball went through hoop
          setScore(prev => prev + 2)
        }
        
        // Reset ball position
        setTimeout(() => {
          setBallPosition({ x: 0, y: 0 })
          setIsShooting(false)
        }, 500)
      }
    }
    animate()
  }

  const resetGame = () => {
    setShowInstructions(true)
    setIsPlaying(false)
    setTimeLeft(30)
    setScore(0)
    setShots(0)
    setIsShooting(false)
    setBallPosition({ x: 0, y: 0 })
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
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
              borderRadius: '16px',
              padding: '20px',
              width: '320px',
              height: '480px',
              textAlign: 'center',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
              border: '2px solid #ff4500',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
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
                zIndex: 10
              }}
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </motion.button>

            {showInstructions ? (
              /* Instructions Screen */
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '2px solid #ff4500'
              }}>
                <div style={{
                  fontSize: '1.7rem', // larger title
                  fontWeight: '700',
                  color: '#ff4500',
                  marginBottom: '20px'
                }}>
                  🏀 Mini Basketball
                </div>
                
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '1rem',
                    color: '#333',
                    lineHeight: '1.6',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: '12px 0' }}>
                      • Click anywhere to shoot
                    </p>
                    <p style={{ margin: '12px 0' }}>
                      • Ball shoots toward your click
                    </p>
                    <p style={{ margin: '12px 0' }}>
                      • You have 10 shots
                    </p>
                    <p style={{ margin: '12px 0' }}>
                      • Each basket = 2 points
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlay}
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    background: 'linear-gradient(45deg, #ff4500, #ff6b35)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                    marginTop: '20px'
                  }}
                >
                  Play Game
                </motion.button>
              </div>
            ) : (
              /* Basketball Court */
              <div 
                ref={gameAreaRef}
                onClick={handleShoot}
                style={{
                  background: 'linear-gradient(135deg, #ff8c42, #ffa500)',
                  borderRadius: '12px',
                  padding: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '3px solid #333',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: isPlaying && !isShooting ? 'crosshair' : 'default'
                }}
              >
                {/* Score and Time Display */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  zIndex: 5
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#ff4500',
                    border: '2px solid #ff4500'
                  }}>
                    Score: {score}
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#ff4500',
                    border: '2px solid #ff4500'
                  }}>
                    Shots: {shots}/{maxShots}
                  </div>
                </div>

                {/* Court lines */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  height: '60%',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px'
                }} />

                {/* Backboard and hoop */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 3
                }}>
                  {/* Backboard support */}
                  <div style={{
                    width: '6px',
                    height: '40px',
                    background: 'linear-gradient(45deg, #666, #999)',
                    margin: '0 auto',
                    borderRadius: '3px'
                  }} />
                  
                  {/* Backboard */}
                  <div style={{
                    width: '80px',
                    height: '50px',
                    background: 'linear-gradient(45deg, #fff, #f0f0f0)',
                    border: '3px solid #333',
                    borderRadius: '6px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                    position: 'relative'
                  }}>
                    {/* Backboard rectangle */}
                    <div style={{
                      width: '60px',
                      height: '35px',
                      border: '2px solid #333',
                      borderRadius: '3px',
                      background: 'linear-gradient(45deg, #fff, #f8f8f8)',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }} />
                    
                    {/* Basketball hoop */}
                    <div style={{
                      width: '70px', // larger hoop
                      height: '70px',
                      border: '6px solid #ff4500',
                      borderRadius: '50%',
                      background: 'transparent',
                      position: 'absolute',
                      bottom: '-35px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}>
                      {/* Net */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '56px',
                        height: '28px',
                        background: 'linear-gradient(to bottom, rgba(255, 69, 0, 0.4), rgba(255, 69, 0, 0.1))',
                        borderRadius: '0 0 28px 28px',
                        border: '1px solid rgba(255, 69, 0, 0.3)'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Basketball */}
                <div
                  style={{
                    position: 'absolute',
                    left: ballPosition.x || '50%',
                    top: ballPosition.y || '80%',
                    transform: 'translate(-50%, -50%)',
                    width: '36px', // larger ball
                    height: '36px',
                    background: 'radial-gradient(circle at 30% 30%, #ff8c00, #ff4500)',
                    borderRadius: '50%',
                    border: '3px solid #cc3700',
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.3)',
                    zIndex: 4,
                    transition: isShooting ? 'none' : 'all 0.1s ease'
                  }}
                />

                {/* Game Over Screen */}
                {!isPlaying && (timeLeft === 0 || shots >= maxShots) && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      marginBottom: '16px'
                    }}>
                      Game Over!
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      marginBottom: '20px'
                    }}>
                      Final Score: {score} points
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetGame}
                      style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      Play Again
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 