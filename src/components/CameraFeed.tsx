import React from 'react';
import { useCamera } from '../hooks/useCamera';

interface CameraFeedProps {
    // Peut accepter des props pour des instructions ou d'autres overlays
    instruction: string; 
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ instruction }) => {
    
    // Utilisation du hook personnalisé
    const { videoRef, canvasRef, dimensions, error } = useCamera();
    
    const containerStyle: React.CSSProperties = {
        width: dimensions.width,
        height: dimensions.height,
    };
    
    // Affichage de l'erreur
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-100 text-red-800 text-center p-8">
                <p className="border border-red-400 p-4 rounded-lg shadow-md">
                    ❌ Erreur Caméra : {error}
                </p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 p-4">
            <div 
                className="relative shadow-xl rounded-lg overflow-hidden border-8 border-gray-900"
                style={containerStyle} // Définit la taille du conteneur
            >
                
                {/* 1. Élément Vidéo (Source) */}
                <video 
                    ref={videoRef}
                    className="absolute w-full h-full transform scale-x-[-1]" // Miroir
                    playsInline 
                    muted 
                    autoPlay
                />
                
                {/* 2. Élément Canvas (Superposition pour les dessins) */}
                <canvas 
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]" 
                />

                {/* 3. Zone de Feedback */}
                <div className="absolute top-0 left-0 right-0 text-center text-white text-xl font-semibold p-3 bg-black bg-opacity-40">
                    <p>{instruction}</p>
                </div>

                {/* Affichage d'un loader pendant le chargement initial */}
                {dimensions.width === 640 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white">
                        Chargement de la caméra...
                    </div>
                )}
            </div>
        </div>
    );
};