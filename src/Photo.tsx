import React, { useRef, useState } from 'react';

interface PhotoProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHOTO_COUNT = 3;

const RECT_WIDTH = 400;
const RECT_HEIGHT = 180;

const Photo: React.FC<PhotoProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<(string | null)[]>(Array(PHOTO_COUNT).fill(null));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start camera for a specific slot
  const handleStartCamera = async (index: number) => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setActiveIndex(index);
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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setPhotos(prev => {
        const updated = [...prev];
        updated[activeIndex] = dataUrl;
        return updated;
      });
      handleCloseCamera();
    }
  };

  // Stop camera
  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setActiveIndex(null);
    setError(null);
  };

  // Close popup and camera
  const handleClose = () => {
    handleCloseCamera();
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 2000,
      margin: 0,
      padding: 0,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 18,
          right: 24,
          background: 'transparent',
          color: '#222',
          border: 'none',
          borderRadius: '50%',
          fontSize: '1.5rem',
          fontWeight: 700,
          cursor: 'pointer',
          width: 36,
          height: 36,
          lineHeight: '36px',
          textAlign: 'center',
          zIndex: 2100,
        }}
        aria-label="Close"
      >
        ×
      </button>
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
            {/* Show photo if taken */}
            {img && (
              <img
                src={img}
                alt={`Photo ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            {/* If this is the next available slot, show camera or camera button */}
            {!img && activeIndex === i && stream && (
              <>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 0,
                    background: '#fff',
                  }}
                  autoPlay
                  playsInline
                  muted
                />
                <button
                  onClick={handleTakePhoto}
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'transparent',
                    border: '4px solid #fff',
                    boxShadow: '0 2px 8px #0002',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100,
                  }}
                  aria-label="Take Photo"
                />
              </>
            )}
            {/* If this is the next available slot, show camera button */}
            {!img && activeIndex === null && photos.findIndex(p => p === null) === i && (
              <button
                onClick={() => handleStartCamera(i)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: '4px solid #fff',
                  boxShadow: '0 2px 8px #0002',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Open Camera"
              />
            )}
          </div>
        ))}
      </div>
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default Photo; 