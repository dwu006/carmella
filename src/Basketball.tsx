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
    if (!isPlaying || isShooting || !gameAreaRef.current) return
    
    setIsShooting(true)
    setShots(prev => prev + 1)
    
    const rect = gameAreaRef.current.getBoundingClientRect()
    const ballStartX = rect.width / 2 // Center of game area
    const ballStartY = rect.height * 0.85 // Bottom area where ball starts
    
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    
    // Calculate direction and distance from ball to click
    const deltaX = clickX - ballStartX
    const deltaY = ballStartY - clickY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // Normalize direction
    const directionX = deltaX / distance
    const directionY = deltaY / distance
    
    // Calculate realistic basketball shot parameters
    const maxDistance = Math.sqrt(ballStartX * ballStartX + ballStartY * ballStartY)
    const power = Math.min(distance / maxDistance * 1.8, 1.5) // More realistic power scaling
    
    // Calculate initial velocity components
    const initialVelocityX = directionX * power * 400
    const initialVelocityY = directionY * power * 400
    
    // Gravity constant for realistic arc
    const gravity = 800
    
    // Animate ball with realistic physics
    let time = 0
    const timeStep = 0.016 // 60fps
    
    const animate = () => {
      if (time < 2) { // Max 2 seconds of animation
        time += timeStep
        
        // Calculate position using projectile motion equations
        const x = ballStartX + initialVelocityX * time
        const y = ballStartY - initialVelocityY * time - 0.5 * gravity * time * time
        
        setBallPosition({ x, y })
        requestAnimationFrame(animate)
      } else {
        // Check if ball went through hoop
        const finalX = ballStartX + initialVelocityX * 1.5 // Check at peak of arc
        const finalY = ballStartY - initialVelocityY * 1.5 - 0.5 * gravity * 1.5 * 1.5
        const hoopCenterX = rect.width / 2
        const hoopCenterY = 100 // Top area where hoop is
        
        const distanceFromHoop = Math.sqrt(
          Math.pow(finalX - hoopCenterX, 2) + 
          Math.pow(finalY - hoopCenterY, 2)
        )
        
        if (distanceFromHoop < 40 && finalY > 80) { // Ball went through hoop
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
              borderRadius: '20px',
              padding: '24px',
              width: '420px', // Bigger popup
              height: '600px', // Bigger popup
              textAlign: 'center',
              boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4)',
              border: '3px solid #ff4500',
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
                top: '12px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '42px',
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
                borderRadius: '16px',
                padding: '32px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '3px solid #ff4500'
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#ff4500',
                  marginBottom: '24px',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  Mini Basketball
                </div>
                
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '1.2rem',
                    color: '#333',
                    lineHeight: '2',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}>
                    <p style={{ margin: '16px 0', fontWeight: '600' }}>
                      Click anywhere to shoot basketball
                    </p>
                    <p style={{ margin: '16px 0', fontWeight: '600' }}>
                      You have 30 seconds to shoot as many shots as possible.
                    </p>
                    <p style={{ margin: '16px 0', fontWeight: '600', color: '#ff4500' }}>
                      Good luck!
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlay}
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    padding: '18px 36px',
                    borderRadius: '14px',
                    background: 'linear-gradient(45deg, #ff4500, #ff6b35)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                    marginTop: '24px',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Start Game
                </motion.button>
              </div>
            ) : (
              /* Basketball Court */
              <div 
                ref={gameAreaRef}
                onClick={handleShoot}
                style={{
                  background: 'linear-gradient(135deg, #ff8c42, #ffa500)',
                  borderRadius: '16px',
                  padding: '20px',
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
                  marginBottom: '12px',
                  zIndex: 5
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#ff4500',
                    border: '2px solid #ff4500',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    Score: {score}
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#ff4500',
                    border: '2px solid #ff4500',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    Time: {timeLeft}s
                  </div>
                </div>

                {/* Court lines */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '85%',
                  height: '65%',
                  border: '3px solid rgba(255, 255, 255, 0.9)',
                  borderRadius: '10px'
                }} />

                {/* Backboard and hoop */}
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 3
                }}>
                  {/* Backboard support */}
                  <div style={{
                    width: '8px',
                    height: '50px',
                    background: 'linear-gradient(45deg, #666, #999)',
                    margin: '0 auto',
                    borderRadius: '4px'
                  }} />
                  
                  {/* Backboard */}
                  <div style={{
                    width: '100px',
                    height: '60px',
                    background: 'linear-gradient(45deg, #fff, #f0f0f0)',
                    border: '4px solid #333',
                    borderRadius: '8px',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)',
                    position: 'relative'
                  }}>
                    {/* Backboard rectangle */}
                    <div style={{
                      width: '80px',
                      height: '45px',
                      border: '3px solid #333',
                      borderRadius: '4px',
                      background: 'linear-gradient(45deg, #fff, #f8f8f8)',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }} />
                    
                    {/* Basketball hoop */}
                    <div style={{
                      width: '85px',
                      height: '85px',
                      border: '8px solid #ff4500',
                      borderRadius: '50%',
                      background: 'transparent',
                      position: 'absolute',
                      bottom: '-42px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      {/* Net */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '68px',
                        height: '35px',
                        background: 'linear-gradient(to bottom, rgba(255, 69, 0, 0.5), rgba(255, 69, 0, 0.1))',
                        borderRadius: '0 0 35px 35px',
                        border: '2px solid rgba(255, 69, 0, 0.4)'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Basketball */}
                <div
                  style={{
                    position: 'absolute',
                    left: ballPosition.x || '50%',
                    top: ballPosition.y || '85%',
                    transform: 'translate(-50%, -50%)',
                    width: '42px',
                    height: '42px',
                    background: 'radial-gradient(circle at 30% 30%, #ff8c00, #ff4500)',
                    borderRadius: '50%',
                    border: '4px solid #cc3700',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
                    zIndex: 4,
                    transition: isShooting ? 'none' : 'all 0.1s ease'
                  }}
                />

                {/* Game Over Screen */}
                {!isPlaying && timeLeft === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    borderRadius: '16px'
                  }}>
                    <div style={{
                      fontSize: '1.6rem',
                      fontWeight: '700',
                      marginBottom: '20px',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                    }}>
                      Time's Up!
                    </div>
                    <div style={{
                      fontSize: '1.4rem',
                      marginBottom: '24px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '16px 24px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      Final Score: {score} points
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      marginBottom: '20px',
                      color: '#ccc'
                    }}>
                      Shots taken: {shots}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetGame}
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        padding: '14px 28px',
                        borderRadius: '10px',
                        background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
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