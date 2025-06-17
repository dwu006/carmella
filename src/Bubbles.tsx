import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const generateBubbles = (count: number) => {
  const uniqueId = Math.random().toString(36).slice(2)
  return Array.from({ length: count }).map((_, i) => ({
    key: `${uniqueId}-${i}`,
    size: Math.random() * 40 + 36,
    left: i < count / 2 ? Math.random() * 40 : 40 + Math.random() * 60,
    delay: Math.random() * 4,
    duration: 6 + Math.random() * 6,
    opacity: 0.38 + Math.random() * 0.32,
    color: [
      'rgba(255, 255, 255, 0.85)',
      'rgba(255, 182, 217, 0.75)',
      'rgba(161, 196, 253, 0.7)',
      'rgba(252, 182, 159, 0.7)',
      'rgba(252, 210, 244, 0.7)',
      'rgba(255, 255, 255, 0.95)'
    ][Math.floor(Math.random() * 6)],
    yEnd: -1100 - Math.random() * 500,
    xAmp: (Math.random() - 0.5) * 60,
  }))
}

export default function Bubbles({ count = 64 }: { count?: number }) {
  const [bubbles, setBubbles] = useState<any[]>([])

  useEffect(() => {
    setBubbles(generateBubbles(count))
  }, [count])

  return (
    <>
      {bubbles.map(({ key, size, left, delay, duration, opacity, color, yEnd, xAmp }) => (
        <motion.div
          className="bubble"
          key={key}
          animate={{
            y: [0, yEnd],
            x: [0, xAmp, 0],
            opacity: [0, opacity, 0],
          }}
          transition={{
            delay,
            duration,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            times: [0, 0.5, 1],
          }}
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            background: color,
            boxShadow: `0 0 32px 8px ${color}`,
          }}
        />
      ))}
    </>
  )
} 