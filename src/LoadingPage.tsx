import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

export default function LoadingPage() {
  const navigate = useNavigate()
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/cafe')
    }, 1800)
    return () => clearTimeout(timeout)
  }, [navigate])
  return (
    <div className="loading-screen">
      <div className="floating-shape floating1" />
      <div className="floating-shape floating2" />
      <div className="floating-shape floating3" />
      <div className="entering-text">entering ...</div>
    </div>
  )
} 