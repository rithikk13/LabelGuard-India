import React, { useState, useEffect, useRef } from 'react';
import { Camera, Video, VideoOff, X, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose?: () => void;
  isMultiFace?: boolean;
  currentFace?: 'front' | 'back' | 'side';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  isMultiFace = false,
  currentFace = 'front'
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check for multiple cameras
  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (err) {
        console.warn('Could not enumerate cameras:', err);
      }
    };
    checkCameras();
  }, []);

  // Start camera
  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsCameraActive(true);
      
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application.');
      } else {
        setError('Could not access camera: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
    // Attach stream after video element is rendered
useEffect(() => {
  if (videoRef.current && stream) {
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(console.error);
  }
}, [stream]);

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Use captured photo
  const usePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      cleanup();
    }
  };

  // Switch camera
  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(startCamera, 100);
  };

  // Cleanup
  const cleanup = () => {
    stopCamera();
    if (onClose) onClose();
  };

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={cleanup}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <div className="text-white font-bold text-sm">
            {isMultiFace ? `Capture ${currentFace.toUpperCase()} Face` : 'Capture Product Label'}
          </div>
          <div className="text-white/70 text-xs">
            Align mandatory declarations in frame
          </div>
        </div>

        {hasMultipleCameras && (
          <button
            onClick={switchCamera}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            disabled={!isCameraActive}
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
              <h3 className="text-white font-bold mb-2">Camera Error</h3>
              <p className="text-white/80 text-sm mb-4">{error}</p>
              <button
                onClick={cleanup}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {isCameraActive && !error && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            
            {/* Viewfinder Guidelines */}
            <div className="absolute inset-8 border-2 border-dashed border-sky-400/50 rounded-lg pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-sky-400"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-sky-400"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-sky-400"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-sky-400"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 text-white text-xs px-3 py-1.5 rounded backdrop-blur-sm font-mono">
                  Align Label Here
                </div>
              </div>
            </div>
          </>
        )}

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Footer Controls */}
      <div className="p-6 bg-gradient-to-t from-black/50 to-transparent">
        {capturedImage ? (
          /* Captured Image Controls */
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={retakePhoto}
              className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-semibold">Retake</span>
            </button>
            
            <button
              onClick={usePhoto}
              className="flex items-center space-x-2 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full transition font-bold shadow-lg"
            >
              <Check className="w-5 h-5" />
              <span>Use Photo</span>
            </button>
          </div>
        ) : (
          /* Camera Capture Controls */
<div className="flex flex-col items-center justify-center gap-2 pb-4">
  <button
    onClick={captureImage}
    disabled={!isCameraActive || isLoading}
    className="w-20 h-20 rounded-full bg-white hover:bg-slate-100 transition flex items-center justify-center shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center">
      <Camera className="w-7 h-7 text-slate-900" />
    </div>
  </button>

   <span className="text-white text-sm font-semibold">
    Capture
  </span>
</div>
  )}
</div>
</div>
);
};