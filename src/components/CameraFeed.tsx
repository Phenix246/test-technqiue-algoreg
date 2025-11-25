import React, { useRef } from 'react';
import { useCamera } from '../hooks/useCamera';

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
    
    // Affichage de l'erreur
   /* if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-100 text-red-800 text-center p-8">
                <p className="border border-red-400 p-4 rounded-lg shadow-md">
                    ❌ Erreur Caméra : {error}
                </p>
            </div>
        );
    }*/

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
            
            {/* Balise Vidéo */}
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
            
            {/* Canvas (peut être retiré si vous ne dessinez rien) */}
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