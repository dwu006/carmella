import './App.css'

export default function Cafe() {
  return (
    <div className="loading-screen">
      <div className="floating-shape floating1" />
      <div className="floating-shape floating2" />
      <div className="floating-shape floating3" />
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', zIndex: 10, position: 'relative',
      }}>
        <h1 className="cafe-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
          Welcome to Carmella's Maid Cafe 3D!
        </h1>
        <div style={{
          fontFamily: "'Baloo 2', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif",
          fontSize: '1.2rem',
          color: '#fff',
          opacity: 0.9,
          textAlign: 'center',
          textShadow: '0 2px 8px #ffb6b9, 0 1px 2px #fff6fb',
        }}>
          3D scene coming soon...
        </div>
      </div>
    </div>
  )
} 