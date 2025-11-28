import React, { useEffect, useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useFaceLandmarker } from '../hooks/useFaceLandmarker';
import { useFaceDetection } from '../hooks/useFaceDetection';

interface CameraFeedProps {
    instruction: string; 
    width: number;
    height: number;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ instruction }) => {

    // Utilisation du hook personnalisé
    const { videoRef, canvasRef, dimensions, isCameraReady, error } = useCamera();
    
    const message = error
        ? `❌ Erreur: ${error}`
        : "Chargement de la caméra...";


    const { faceLandmarker, isLandmarkerReady, landmarkerError } = useFaceLandmarker();
    
    // État pour contrôler si l'analyse est active
    const [isRunning, setIsRunning] = useState(false); 

    useEffect(() => {
        const startCamera = async () => {
            if (videoRef.current) {
                 const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                 videoRef.current.srcObject = stream;
            }
        };

        if (isLandmarkerReady) {
            startCamera();
            setIsRunning(true)
        }
        
    }, [isLandmarkerReady]);

    useFaceDetection({ 
        faceLandmarker, 
        videoRef, 
        canvasRef, 
        isLandmarkerReady,
        isRunning // L'analyse n'est active que si isRunning est true
    });

    return (
        <div style={{ position: 'relative', width: dimensions.width, height: dimensions.height }}>
            
            {/* Affichage conditionnel tant que la caméra n'est pas prête */}
            {!isCameraReady && (
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '20px',
                        zIndex: 10,
                    }}
                >
                    {message}
                </div>
            )}
            
            <video
                ref={videoRef}
                width={dimensions.width}
                height={dimensions.height}
                autoPlay
                playsInline
                muted
                // Le style flip l'image pour un effet miroir
                style={{ transform: 'scaleX(-1)' }}
            />
            
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    transform: 'scaleX(-1)' 
                }}
            />
        </div>
    );
};