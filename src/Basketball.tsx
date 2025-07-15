import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface BasketballProps {
  isOpen: boolean
  onClose: () => void
}

export default function Basketball({ isOpen, onClose }: BasketballProps) {
  const [showInstructions, setShowInstructions] = useState(true)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('basketball-high-score');
    return saved ? parseInt(saved) : 0;
  })
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShooting, setIsShooting] = useState(false)
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 })
  const [ballVisible, setBallVisible] = useState(true)
  const [shots, setShots] = useState(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  
  // Moving hoop state
  const [hoopPosition, setHoopPosition] = useState(50) // percentage from left (50 = center)
  const [hoopDirection, setHoopDirection] = useState(1) // 1 for right, -1 for left

  // Reset to instructions screen every time the component opens
  useEffect(() => {
    if (isOpen) {
      setShowInstructions(true)
      setIsPlaying(false)
      setTimeLeft(30)
      setScore(0)
      setShots(0)
      setIsShooting(false)
      setBallPosition({ x: 0, y: 0 })
      setBallVisible(true)
      setHoopPosition(50)
      setHoopDirection(1)
    }
  }, [isOpen])

  // Animate hoop movement during gameplay
  useEffect(() => {
    if (isPlaying) {
      const moveHoop = setInterval(() => {
        setHoopPosition(prev => {
          const newPos = prev + (hoopDirection * 0.8) // Adjust speed here (0.8% per frame)
          
          // Bounce off edges (keep hoop within 20-80% range)
          if (newPos >= 80) {
            setHoopDirection(-1)
            return 80
          } else if (newPos <= 20) {
            setHoopDirection(1)
            return 20
          }
          
          return newPos
        })
      }, 50) // Update every 50ms for smooth movement
      
      return () => clearInterval(moveHoop)
    }
  }, [isPlaying, hoopDirection])

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false)
            // game ended, check high score
            setHighScore(prevHigh => {
              if (score > prevHigh) {
                localStorage.setItem('basketball-high-score', score.toString());
                return score;
              }
              return prevHigh;
            });
            return 0;
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isPlaying, timeLeft, score]) // Added score to dependency array

  const handlePlay = () => {
    setShowInstructions(false)
    setIsPlaying(true)
    setTimeLeft(30)
    setScore(0)
    setShots(0)
    setBallVisible(true)
    setBallPosition({ x: 0, y: 0 })
    setHoopPosition(50)
    setHoopDirection(1)
    // load high score again in case storage changed
    const saved = localStorage.getItem('basketball-high-score');
    if (saved) setHighScore(parseInt(saved));
  }



  const handleShoot = (e: React.MouseEvent) => {
    if (!isPlaying || isShooting || !gameAreaRef.current) return;
    setIsShooting(true);
    setShots(prev => prev + 1);
    const rect = gameAreaRef.current.getBoundingClientRect();
    const ballStartX = rect.width / 2;
    const ballStartY = rect.height * 0.85;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const deltaX = clickX - ballStartX;
    const deltaY = ballStartY - clickY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const directionX = deltaX / distance;
    const directionY = deltaY / distance;
    const maxDistance = Math.sqrt(ballStartX * ballStartX + ballStartY * ballStartY);
    const power = Math.min(distance / maxDistance * 2.5, 2.0); // Increased power
    let velocityX = directionX * power * 500; // Increased velocity
    let velocityY = directionY * power * 500; // Increased velocity
    const gravity = 800;
    let time = 0;
    const timeStep = 0.016;
    let posX = ballStartX;
    let posY = ballStartY;
    let scored = false;
    
    const animate = () => {
      if (time < 3 && !scored) { // Increased max time to 3 seconds
        time += timeStep;
        posX += velocityX * timeStep;
        posY -= velocityY * timeStep;
        velocityY -= gravity * timeStep;
        setBallPosition({ x: posX, y: posY });
        
        // Check if ball is off-screen (with some margin)
        const margin = 50;
        if (posX < -margin || posX > rect.width + margin || posY < -margin || posY > rect.height + margin) {
          console.log('Ball went off-screen - despawning');
          setBallVisible(false);
          // Spawn new ball much faster
          setTimeout(() => {
            setBallPosition({ x: 0, y: 0 });
            setBallVisible(true);
            setIsShooting(false);
          }, 50);
          return;
        }
        
        // Check for scoring during flight (more realistic)
        // Calculate exact hoop center position based on visual layout
        const hoopCenterX = (hoopPosition / 100) * rect.width; // Use dynamic hoop position
        // Hoop Y calculation: container(30) + support(50) + backboard(60) - hoop_offset(42) = 98px from game area top
        const hoopCenterY = 98; // More accurate hoop center Y position  
        const distanceFromHoop = Math.sqrt(
          Math.pow(posX - hoopCenterX, 2) + 
          Math.pow(posY - hoopCenterY, 2)
        );
        
        // More precise scoring - smaller area for increased difficulty
        if (distanceFromHoop < 35 && posY > 80 && posY < 120 && velocityY < 0) {
          console.log(`SCORE! Ball went through hoop at position ${hoopPosition.toFixed(1)}%`, 
                     `Ball: (${posX.toFixed(1)}, ${posY.toFixed(1)})`, 
                     `Hoop: (${hoopCenterX.toFixed(1)}, ${hoopCenterY})`);
          setScore(prev => prev + 1);
          scored = true;
          // Make ball disappear immediately after scoring
          setBallVisible(false);
          // Spawn new ball faster
          setTimeout(() => {
            setBallPosition({ x: 0, y: 0 });
            setBallVisible(true);
            setIsShooting(false);
          }, 50);
          return;
        }
        
        requestAnimationFrame(animate);
      } else {
        // Ball finished trajectory without scoring
        console.log('Ball finished trajectory - no score');
        // Make ball fade out naturally
        setBallVisible(false);
        // Spawn new ball faster
        setTimeout(() => {
          setBallPosition({ x: 0, y: 0 });
          setBallVisible(true);
          setIsShooting(false);
        }, 50);
      }
    };
    animate();
  };

  const resetGame = () => {
    setShowInstructions(true)
    setIsPlaying(false)
    setTimeLeft(30)
    setScore(0)
    setShots(0)
    setIsShooting(false)
    setBallPosition({ x: 0, y: 0 })
    setBallVisible(true)
    setHoopPosition(50)
    setHoopDirection(1)
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
                top: '4px',
                right: '8px',
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
                  Mini Basketball 🏀
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
                    marginBottom: '16px',
                    paddingLeft: '16px',
                    paddingRight: '16px'
                  }}>
                    <p style={{ margin: '16px 0', fontWeight: '600' }}>
                      Click anywhere to shoot basketball
                    </p>
                    <p style={{ margin: '16px 0', fontWeight: '600' }}>
                      You have 30 seconds to score as many baskets as possible.
                    </p>
                    <p style={{ margin: '16px 0', fontWeight: '600', color: '#ff4500' }}>
                      Each basket is a point!
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
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    padding: '12px 24px',
                    borderRadius: '20px',
                    background: 'linear-gradient(45deg, #ff4500, #ff6b35)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                    marginTop: '8px',
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
                  left: `${hoopPosition}%`,
                  transform: 'translateX(-50%)',
                  zIndex: 3,
                  transition: 'left 0.05s linear' // Smooth movement
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
                {ballVisible && (
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
                      transition: isShooting ? 'none' : 'all 0.1s ease',
                      opacity: ballVisible ? 1 : 0
                    }}
                  />
                )}

                {/* Game Over Screen */}
                {!isPlaying && timeLeft === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.85)',
                      zIndex: 101,
                    }} />
                    <div style={{
                      position: 'relative',
                      zIndex: 102,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      color: '#fff',
                    }}>
                      <div style={{
                        fontSize: '1.6rem',
                        fontWeight: '700',
                        marginBottom: '20px',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                        color: '#fff',
                      }}>
                        Time's Up!
                      </div>
                      <div style={{
                        fontSize: '1.4rem',
                        marginBottom: '24px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                      }}>
                        Final Score: {score} points
                      </div>
                      <div style={{
                        fontSize: '1.3rem',
                        marginBottom: '20px',
                        color: '#ffd700',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                      }}>
                        High Score: {highScore}
                      </div>
                      <div style={{
                        fontSize: '1.1rem',
                        marginBottom: '20px',
                        color: '#fff'
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