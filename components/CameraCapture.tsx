
import React, { useRef, useState, useEffect } from 'react';
import { ImageData } from '../types';

interface CameraCaptureProps {
  onCapture: (data: ImageData) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Could not access camera. Please check permissions.");
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current video frame to the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture({
          base64: dataUrl,
          mimeType: 'image/jpeg'
        });
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl overflow-hidden relative">
      {error ? (
        <div className="p-12 text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-red-400">{error}</p>
          <button onClick={onCancel} className="mt-6 text-indigo-400 hover:text-white underline">Go back</button>
        </div>
      ) : (
        <div className="relative aspect-video bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }} // Typical selfie view
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8">
            <button 
              onClick={onCancel}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all backdrop-blur-md border border-white/20"
              title="Cancel"
            >
              <i className="fas fa-times text-white"></i>
            </button>
            
            <button 
              onClick={takePhoto}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              title="Capture"
            >
              <div className="w-16 h-16 rounded-full border-4 border-black/10"></div>
            </button>

            <div className="w-12"></div> {/* Spacer for balance */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
