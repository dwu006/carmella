import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface GachaPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function Gacha({ isOpen, onClose }: GachaPopupProps) {
  const [timeUntilNextPull, setTimeUntilNextPull] = useState(0)
  const [canPull, setCanPull] = useState(true)
  const [showGachaAnimation, setShowGachaAnimation] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationHasRun = useRef(false)
  const [animationFinished, setAnimationFinished] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)   // NEW – controls endless spin
  const animationValuesRef = useRef<{finalPosition: number, duration: number, animationId: string} | null>(null)

  // Define smiskis array
  const smiskis = [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9];

  // Actual image widths for each Smiski (measured from the rendered images)
  const smiskiWidths = {
    1.1: 120, // Approximate actual rendered width
    1.2: 100,
    1.3: 140,
    1.4: 110,
    1.5: 130,
    1.6: 140,
    1.7: 150,
    1.8: 90,
    1.9: 160
  };

  // Calculate the actual position of each Smiski based on cumulative widths
  const calculateSmiskiPosition = (index: number) => {
    let position = 0;
    const gap = 30;
    
    for (let i = 0; i < index; i++) {
      const smiskiNum = smiskis[i];
      const actualWidth = smiskiWidths[smiskiNum as keyof typeof smiskiWidths] || 300;
      position += actualWidth + gap;
    }
    
    return position;
  };

  // Track unlocked smiskis in localStorage
  const [unlockedSmiskis, setUnlockedSmiskis] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('unlockedSmiskis');
      return stored ? JSON.parse(stored).map(Number) : [];
    } catch {
      return [];
    }
  });

  // Function to clear unlocked smiskis from localStorage (for testing)
  const clearUnlockedSmiskis = () => {
    localStorage.removeItem('unlockedSmiskis');
    setUnlockedSmiskis([]);
  };

  // Helper to add a smiski to unlocked list
  const unlockSmiski = (num: number) => {
    setUnlockedSmiskis(prev => {
      if (prev.includes(num)) return prev; // If already unlocked, do nothing
      const updated = [...prev, num];
      localStorage.setItem('unlockedSmiskis', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset timer for testing
  useEffect(() => {
    const checkPullAvailability = () => {
      const lastPullTime = localStorage.getItem('lastGachaPull')
      const now = Date.now()
      
      if (!lastPullTime) {
        setCanPull(true)
        setTimeUntilNextPull(0)
        return
      }

      const timeSinceLastPull = now - parseInt(lastPullTime)
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
      
      if (timeSinceLastPull >= fiveMinutes) {
        setCanPull(true)
        setTimeUntilNextPull(0)
      } else {
        setCanPull(false)
        setTimeUntilNextPull(fiveMinutes - timeSinceLastPull)
      }
    }

    checkPullAvailability()
    const interval = setInterval(checkPullAvailability, 1000) // Check every second

    return () => clearInterval(interval)
  }, []) // Remove dependencies that were preventing updates

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePull = () => {
    if (!canPull || isAnimating) return;
    
    // Reset animation state
    setShowGachaAnimation(true);
    setAnimationComplete(false);
    animationHasRun.current = false;
    setAnimationFinished(false);
    setIsSpinning(true);              // start endless spin
    
    // Calculate the width of one complete set of smiskis
    const smiskiWidth = 300, gap = 30, total = smiskiWidth + gap;
    const oneSetWidth = smiskis.length * total;
    
    // for endless spin we need to move one full set width
    const duration = 1.5; // 1.5 s per loop
    animationValuesRef.current = {
      finalPosition: -oneSetWidth, // move one full set to the left
      duration,
      animationId: Date.now().toString()
    };

    setIsAnimating(true);
    
    // No fallback needed — animationComplete handled by framer-motion callback
  };

  // Gacha Animation Component
  const GachaAnimation = () => {
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing underlying popup
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
        {/* Egg that cracks open */}
        <motion.div
          style={{
            width: '300px',
            height: '300px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isSpinning ? 'pointer' : 'default'
          }}
          onClick={() => {
            if (!isSpinning) return;
            
            // Prevent multiple clicks
            setIsSpinning(false);
            
            // Pick a random index from 1-9 (not 0-8)
            const randomIndex = Math.floor(Math.random() * 9) + 1; // 1-9
            const smiskiToUnlock = smiskis[randomIndex - 1]; // Use array directly to avoid floating-point errors
            
            console.log('=== EGG CRACK ===');
            console.log('Random index (1-9):', randomIndex);
            console.log('Will unlock:', smiskiToUnlock);
            console.log('========================');
            
            unlockSmiski(smiskiToUnlock);
            setLandedSmiski(smiskiToUnlock);
            setIsAnimating(true);
            
            // Set animation complete after a delay to trigger auto-return
            setTimeout(() => {
              setAnimationComplete(true);
              setAnimationFinished(true);
              setIsAnimating(false);
              localStorage.setItem('lastGachaPull', Date.now().toString());
            }, 2000);
          }}
        >
          {/* Egg shell */}
          <div
            style={{
              width: '200px',
              height: '250px',
              background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              border: '3px solid #d0d0d0',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              position: 'absolute',
              zIndex: isSpinning ? 2 : 0,
              cursor: isSpinning ? 'pointer' : 'default',
              opacity: isSpinning ? 1 : 0,
              transition: 'opacity 0.3s'
            }}
          />
          
          {/* Smiski inside (revealed when egg cracks) */}
          <div
            style={{
              width: '200px',
              height: '200px',
              position: 'absolute',
              zIndex: !isSpinning ? 1 : 0,
              opacity: !isSpinning ? 1 : 0
            }}
          >
            {landedSmiski && (
              <img
                src={`/smiskis/${landedSmiski}.png`}
                alt={`Smiski ${landedSmiski}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '50px',
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#fff',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
            textAlign: 'center'
          }}
        >
          {isSpinning ? 'Click to open!' : '!'}
        </motion.div>
      </motion.div>
    );
  };

  // In GachaAnimation, track which smiski was landed on
  const [landedSmiski, setLandedSmiski] = useState<number | null>(null);

  // After animation lands, auto-exit after 3 seconds
  useEffect(() => {
    if (animationComplete && showGachaAnimation) {
      const timeout = setTimeout(() => {
        setShowGachaAnimation(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [animationComplete, showGachaAnimation]);



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
                right: '32px',
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
              {/* Smiski images overlay */}
              <div style={{
                position: 'absolute',
                top: '38px', // visually above the rectangle
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10,
                pointerEvents: 'none', // allow clicks to pass through
              }}>
                {[1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9].filter(num => unlockedSmiskis.includes(num)).map(num => {
                  let position = {};
                  if (num === 1.1) position = { left: '250px', top: '75px' };
                  if (num === 1.2) position = { left: '102px', top: '-31px' };
                  if (num === 1.3) position = { left: '470px', top: '187px' };
                  if (num === 1.4) position = { left: '95px', top: '75px' };
                  if (num === 1.5) position = { left: '295px', top: '-30px' };
                  if (num === 1.6) position = { left: '480px', top: '-30px' };
                  if (num === 1.7) position = { left: '130px', top: '185px' };
                  if (num === 1.8) position = { left: '300px', top: '170px' };
                  if (num === 1.9) position = { left: '417px', top: '73px' };
                  return (
                    <div key={num} style={{
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      ...position
                    }}>
                      <img
                        src={`/smiskis/${num}.png`}
                        alt={`Smiski ${num}`}
                        style={{ width: '110px', height: '110px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))' }}
                      />
                    </div>
                  );
                })}
              </div>
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
        {showGachaAnimation && (
          <GachaAnimation />
        )}
      </AnimatePresence>

      {/* DEBUG BUTTON TO CLEAR LOCALSTORAGE */}
      <div style={{position:'fixed',top:10,left:10,zIndex:3000}}>
        <button onClick={() => { localStorage.removeItem('unlockedSmiskis'); localStorage.removeItem('lastGachaPull'); window.location.reload(); }} style={{padding:'8px 16px',borderRadius:8,background:'#fff',color:'#b91c1c',fontWeight:700,border:'2px solid #b91c1c',cursor:'pointer'}}>Clear Smiski LocalStorage</button>
      </div>
    </AnimatePresence>
  )
} 