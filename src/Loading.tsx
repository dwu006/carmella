import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Bubbles from './Bubbles'
import './App.css'

const generateTransitionBubbles = (count: number) => {
  const uniqueId = Math.random().toString(36).slice(2)
  return Array.from({ length: count }).map((_, i) => ({
    key: `transition-${uniqueId}-${i}`,
    size: Math.random() * 60 + 40,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 1.5 + Math.random() * 1,
    opacity: 0.6 + Math.random() * 0.4,
    color: [
      'rgba(255, 255, 255, 0.9)',
      'rgba(255, 182, 217, 0.85)',
      'rgba(161, 196, 253, 0.8)',
      'rgba(252, 182, 159, 0.8)',
      'rgba(252, 210, 244, 0.8)',
      'rgba(255, 255, 255, 1)'
    ][Math.floor(Math.random() * 6)],
    yEnd: -window.innerHeight - 200,
    xAmp: (Math.random() - 0.5) * 40,
  }))
}

export default function Loading() {
  const navigate = useNavigate()
  const [dots, setDots] = useState('.')
  const [status, setStatus] = useState('entering')

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : '.'))
    }, 500)
    return () => clearInterval(dotInterval)
  }, [])

  useEffect(() => {
    const exitTimeout = setTimeout(() => {
      setStatus('exiting')
    }, 3000)
    return () => clearTimeout(exitTimeout)
  }, [])

  const rushBubbles = useMemo(() => {
    return status === 'exiting' ? generateTransitionBubbles(150) : []
  }, [status])

  const handleAnimationComplete = () => {
    if (status === 'exiting') {
      navigate('/cafe', { replace: true })
    }
  }

  return (
    <motion.div
      className="loading-screen"
      animate={{ opacity: status === 'exiting' ? 0 : 1 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      onAnimationComplete={handleAnimationComplete}
    >
      <Bubbles count={64} />
      <div className="floating-shape floating1" />
      <div className="floating-shape floating2" />
      <div className="floating-shape floating3" />
      <div className="entering-text">entering{dots}</div>

      {rushBubbles.map(({ key, size, left, delay, duration, opacity, color, yEnd, xAmp }) => (
          <motion.div
            key={key}
            className="bubble"
            initial={{ x: 0, opacity: 0 }}
            animate={{
              y: yEnd,
              x: xAmp,
              opacity: [0, opacity, 0],
            }}
            transition={{
              delay,
              duration,
              ease: 'easeOut',
              times: [0, 0.2, 1],
            }}
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              background: color,
              boxShadow: `0 0 32px 8px ${color}`,
              filter: 'blur(1.5px) brightness(1.3)',
              mixBlendMode: 'lighten',
            }}
          />
        ))}
    </motion.div>
  )
} 