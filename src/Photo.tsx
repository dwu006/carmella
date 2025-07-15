import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
// Save icon SVG
const SaveIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);

// Replay icon SVG
const ReplayIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
);
// Remove CuteDesigns and all emoji design code

interface PhotoProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHOTO_COUNT = 3;

const RECT_WIDTH = 500;
const RECT_HEIGHT = 225;

const Photo: React.FC<PhotoProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<(string | null)[]>(() => {
    // Load photos from localStorage on component mount
    const savedPhotos = localStorage.getItem('photobooth-photos');
    return savedPhotos ? JSON.parse(savedPhotos) : Array(PHOTO_COUNT).fill(null);
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showFinalStrip, setShowFinalStrip] = useState(false);
  // Remove the BG_COLORS array and stripBg state

  // Save photos to localStorage whenever photos change
  useEffect(() => {
    localStorage.setItem('photobooth-photos', JSON.stringify(photos));
  }, [photos]);

  // Clear photos when component is closed
  useEffect(() => {
    if (!isOpen) {
      setPhotos(Array(PHOTO_COUNT).fill(null));
      localStorage.removeItem('photobooth-photos');
      setShowFinalStrip(false);
      setShowInstructions(true);
    }
  }, [isOpen]);

  // Simple check: if we have 3 photos and not in camera mode, show final strip
  useEffect(() => {
    const photoCount = photos.filter(p => p !== null).length;
    if (photoCount === 3 && !isCameraActive && !showInstructions) {
      setShowFinalStrip(true);
    } else if (photoCount < 3) {
      setShowFinalStrip(false);
    }
  }, [photos, isCameraActive, showInstructions]);

  // Start camera for full screen
  const handleStartCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraActive(true);
      setShowInstructions(false);
      
      // Find first empty slot
      const firstEmpty = photos.findIndex(p => p === null);
      setActiveIndex(firstEmpty !== -1 ? firstEmpty : 0);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setError('Could not access camera.');
    }
  };

  // Take photo for the active slot
  const handleTakePhoto = () => {
    if (!videoRef.current || activeIndex === null) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Use fixed dimensions matching the display ratio (360:160 = 2.25:1)
    const targetWidth = 360;
    const targetHeight = 160;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Calculate source dimensions to maintain aspect ratio
      const videoAspect = video.videoWidth / video.videoHeight;
      const targetAspect = targetWidth / targetHeight;
      
      let sourceX = 0, sourceY = 0, sourceWidth = video.videoWidth, sourceHeight = video.videoHeight;
      
      if (videoAspect > targetAspect) {
        // Video is wider, crop sides
        sourceWidth = video.videoHeight * targetAspect;
        sourceX = (video.videoWidth - sourceWidth) / 2;
      } else {
        // Video is taller, crop top/bottom
        sourceHeight = video.videoWidth / targetAspect;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }
      
      ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
      const dataUrl = canvas.toDataURL('image/png');
      
      setPhotos(prev => {
        const updated = [...prev];
        updated[activeIndex] = dataUrl;
        
        // Count how many photos we have now
        const photoCount = updated.filter(p => p !== null).length;
        
        // If we have 3 photos, close camera (final strip will show via useEffect)
        if (photoCount >= 3) {
          handleCloseCamera();
        } else {
          // Find next empty slot
          const nextEmpty = updated.findIndex(p => p === null);
          setActiveIndex(nextEmpty);
        }
        
        return updated;
      });
    }
  };

  // Stop camera
  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setActiveIndex(null);
    setIsCameraActive(false);
    setError(null);
  };

  // Delete individual photo
  const handleDeletePhoto = (index: number) => {
    setPhotos(prev => {
      const updated = [...prev];
      updated[index] = null;
      
      // Count remaining photos
      const photoCount = updated.filter(p => p !== null).length;
      
      // If we have less than 3 photos, exit final strip and restart camera
      if (photoCount < 3) {
        setShowFinalStrip(false);
        if (!isCameraActive) {
          setTimeout(() => handleStartCamera(), 100);
        } else {
          // Camera already active, just update activeIndex
          setActiveIndex(index);
        }
      }
      
      return updated;
    });
  };

  // Close popup and camera
  const handleClose = () => {
    handleCloseCamera();
    setShowInstructions(true);
    setShowFinalStrip(false);
    // Clear all photos when leaving photobooth
    setPhotos(Array(PHOTO_COUNT).fill(null));
    localStorage.removeItem('photobooth-photos');
    onClose();
  };

  if (!isOpen) return null;
  
  console.log('Photo component rendering, isOpen:', isOpen);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 55%, #fcb69f 100%)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 2000,
      margin: 0,
      padding: 0,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Static bubbles - only show when camera is not active */}
      {!isCameraActive && Array.from({ length: 20 }).map((_, i) => {
        const size = Math.random() * 60 + 40;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: [
                'rgba(255, 255, 255, 0.3)',
                'rgba(255, 182, 217, 0.25)',
                'rgba(161, 196, 253, 0.2)',
                'rgba(252, 182, 159, 0.2)',
                'rgba(252, 210, 244, 0.2)',
                'rgba(255, 255, 255, 0.4)'
              ][Math.floor(Math.random() * 6)],
              filter: 'blur(1.5px) brightness(1.2)',
              boxShadow: '0 0 24px 8px rgba(255,255,255,0.12)',
              mixBlendMode: 'lighten',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        );
      })}
      
      {/* Floating shapes - only show when camera is not active */}
      {!isCameraActive && (
        <>
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            left: '10vw',
            top: '60vh',
            background: 'radial-gradient(circle, #fbc2eb 0%, #a6c1ee 100%)',
            borderRadius: '50%',
            opacity: 0.35,
            filter: 'blur(2px)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          
          <div style={{
            position: 'absolute',
            width: '90px',
            height: '90px',
            right: '15vw',
            top: '20vh',
            background: 'radial-gradient(circle, #fcb69f 0%, #ffdde1 100%)',
            borderRadius: '50%',
            opacity: 0.35,
            filter: 'blur(2px)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          
          <div style={{
            position: 'absolute',
            width: '70px',
            height: '70px',
            left: '40vw',
            bottom: '10vh',
            background: 'radial-gradient(circle, #a1c4fd 0%, #c2e9fb 100%)',
            borderRadius: '50%',
            opacity: 0.35,
            filter: 'blur(2px)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        </>
      )}

      <button
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'none',
          border: 'none',
          fontSize: '32px',
          color: '#fff',
          cursor: 'pointer',
          padding: '4px',
          zIndex: 2100,
          outline: 'none',
        }}
        onClick={handleClose}
        aria-label="Close"
      >
        ×
      </button>

      {showInstructions ? (
        // Instructions Screen
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          maxWidth: 600,
          textAlign: 'center',
          padding: 40,
          position: 'relative',
          zIndex: 10,
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#fff',
            margin: 0,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            fontFamily: "'Baloo 2', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif",
          }}>
            📸 Photobooth
          </h2>
          <div style={{ display: 'flex', gap: 16 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartCamera}
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                padding: '16px 40px',
                borderRadius: 12,
                background: '#d72660',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
              }}
            >
              Start
            </motion.button>

          </div>
        </div>
      ) : isCameraActive ? (
        // Full Camera View
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              background: '#000',
            }}
            autoPlay
            playsInline
            muted
          />
          <button
            onClick={handleTakePhoto}
            style={{
              position: 'absolute',
              bottom: 60,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'transparent',
              border: '6px solid #fff',
              boxShadow: '0 4px 16px #0004',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 100,
            }}
            aria-label="Take Photo"
          />
          {/* In the camera view, show previews in bottom left */}
          {isCameraActive && (
            <div style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              display: 'flex',
              flexDirection: 'row',
              gap: 8,
              zIndex: 200,
            }}>
              {photos.map((img, i) =>
                img ? (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={img}
                      alt={`Preview ${i + 1}`}
                      style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, border: '2px solid #fff', boxShadow: '0 2px 8px #0003' }}
                    />
                    <button
                      onClick={() => handleDeletePhoto(i)}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#ff4444',
                        color: '#fff',
                        border: '2px solid #fff',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                        zIndex: 201,
                        minWidth: '16px',
                        minHeight: '16px',
                        padding: 0,
                      }}
                      aria-label={`Delete photo ${i + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      ) : (
        // Photo Gallery (if needed)
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}>
          {photos.map((img, i) => (
            <div
              key={i}
              style={{
                width: RECT_WIDTH,
                height: RECT_HEIGHT,
                border: '2px solid #222',
                borderRadius: 18,
                background: img ? '#fff' : '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 2px 12px #0001',
              }}
            >
              {img && (
                <img
                  src={img}
                  alt={`Photo ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</div>}
      {/* If showFinalStrip, show the 3 photos stacked vertically on a white page */}
      {showFinalStrip && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 55%, #fcb69f 100%)',
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        }}>
          {/* Static bubbles for final strip background */}
          {Array.from({ length: 20 }).map((_, i) => {
            const size = Math.random() * 60 + 40;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: [
                    'rgba(255, 255, 255, 0.3)',
                    'rgba(255, 182, 217, 0.25)',
                    'rgba(161, 196, 253, 0.2)',
                    'rgba(252, 182, 159, 0.2)',
                    'rgba(252, 210, 244, 0.2)',
                    'rgba(255, 255, 255, 0.4)'
                  ][Math.floor(Math.random() * 6)],
                  filter: 'blur(1.5px) brightness(1.2)',
                  boxShadow: '0 0 24px 8px rgba(255,255,255,0.12)',
                  mixBlendMode: 'lighten',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            );
          })}

          {/* Floating shapes for final strip background */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            left: '10vw',
            top: '60vh',
            background: 'radial-gradient(circle, #fbc2eb 0%, #a6c1ee 100%)',
            borderRadius: '50%',
            opacity: 0.35,
            filter: 'blur(2px)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          
          <div style={{
            position: 'absolute',
            width: '90px',
            height: '90px',
            right: '15vw',
            top: '20vh',
            background: 'radial-gradient(circle, #fcb69f 0%, #ffdde1 100%)',
            borderRadius: '50%',
            opacity: 0.35,
            filter: 'blur(2px)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          
          <div style={{
            position: 'absolute',
            width: '70px',
            height: '70px',
            left: '40vw',
            bottom: '10vh',
            background: 'radial-gradient(circle, #a1c4fd 0%, #c2e9fb 100%)',
            borderRadius: '50%',
            opacity: 0.35,
            filter: 'blur(2px)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />

                      <div id="photobooth-strip" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: 360,
            height: 480, // Fixed height for proper proportions
            background: `url('/photo.png') center/cover no-repeat`,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 2px 12px #0001',
            position: 'relative',
            padding: 0,
            boxSizing: 'border-box',
            zIndex: 10,
          }}>
            {photos.map((img, i) =>
              img ? (
                <img
                  key={i}
                  src={img}
                  alt={`Photo ${i + 1}`}
                  style={{
                    width: 360,
                    height: 160,
                    objectFit: 'cover',
                    border: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'block',
                    borderRadius: i === 0 ? '8px 8px 0 0' : i === photos.length - 1 ? '0 0 8px 8px' : '0',
                  }}
                />
              ) : null
            )}
          </div>
          {/* Color picker row and buttons remain unchanged */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 18, marginTop: 8 }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                const strip = document.getElementById('photobooth-strip');
                if (!strip) return;
                
                try {
                  const canvas = await html2canvas(strip, {
                    width: 360,
                    height: 480,
                    useCORS: true,
                    allowTaint: true,
                    logging: false
                  });
                  
                  // Convert to blob and download as PNG
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.download = `carmella.png`;
                      link.href = url;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }
                  }, 'image/png', 1.0);
                } catch (error) {
                  console.error('Error saving image:', error);
                  alert('Failed to save image. Please try again.');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '1.1rem',
                fontWeight: 700,
                padding: '12px 22px',
                borderRadius: 10,
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 12px #0002',
                cursor: 'pointer',
              }}
            >
              <SaveIcon /> Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                padding: '12px 32px',
                borderRadius: 10,
                background: '#d72660',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 12px #0002',
                cursor: 'pointer',
              }}
            >
              Done
            </motion.button>
          </div>
          
          {/* Replay button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowFinalStrip(false);
              setPhotos(Array(PHOTO_COUNT).fill(null));
              localStorage.removeItem('photobooth-photos');
              setShowInstructions(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 8,
              background: '#FF6B6B',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 12px #0002',
              cursor: 'pointer',
              marginTop: 16,
            }}
            aria-label="Take another polaroid"
          >
            <ReplayIcon />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Photo; 