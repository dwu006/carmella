import { motion } from 'framer-motion'
import './App.css'
import { Routes, Route, /* useNavigate, */ Navigate } from 'react-router-dom'
// import Cafe from './Cafe'
// import Loading from './Loading'
import Bubbles from './Bubbles'
// import SpotifyCallback from './SpotifyCallback'

// Landing component with Enter button
// function LandingScreen({ onEnter, hidden }: { onEnter: () => void, hidden: boolean }) {
//   return (
//     <div className="loading-screen">
//       <Bubbles count={64} />
//       <div className="floating-shape floating1" />
//       <div className="floating-shape floating2" />
//       <div className="floating-shape floating3" />
//       {!hidden && (
//         <>
//           <motion.h1
//             className="cafe-title"
//             initial={{ scale: 0.7, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
//             transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 1.1, y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } }}
//           >
//             carmella's world
//             <img src="/world.png" className="bubbly-logo big" alt="logo" />
//           </motion.h1>
//           <button className="enter-btn" onClick={onEnter}>
//             <span className="enter-btn-text">enter!</span>
//           </button>
//           <div className="bubbly-footer">
//             <span style={{ display: 'block', marginBottom: '8px' }}>to the girl I regret pushing away...</span>
//             <span>i know this isn't much but i hope this little world made you smile!</span>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

// function HomePage() {
//   const navigate = useNavigate()
//   const handleEnter = () => {
//     navigate('/loading')
//   }
//   return <LandingScreen onEnter={handleEnter} hidden={false} />
// }

// PreviewScreen component for the Preview page
function PreviewScreen() {
  return (
    <div className="loading-screen">
      <Bubbles count={64} />
      <div className="floating-shape floating1" />
      <div className="floating-shape floating2" />
      <div className="floating-shape floating3" />
      <motion.h1
        className="cafe-title"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
        transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 1.1, y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } }}
        style={{ color: '#d72660', fontWeight: 700 }}
      >
        coming soon ... ;)
      </motion.h1>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PreviewScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
