import { useRef, useEffect, useState } from 'react';

// Dimensions standard pour la vidéo
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

interface CameraHookResult {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    dimensions: { width: number; height: number };
    isCameraReady: boolean | null;
    error: string | null;
}

/**
 * Hook personnalisé pour initialiser et gérer le flux vidéo de la caméra.
 */
export const useCamera = (): CameraHookResult => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState({ width: VIDEO_WIDTH, height: VIDEO_HEIGHT });
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        const setupCamera = async () => {
            if (!videoRef.current || !canvasRef.current) return;

            try {
                // Demande l'accès à la caméra
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: {
                        width: { ideal: VIDEO_WIDTH },
                        height: { ideal: VIDEO_HEIGHT },
                        facingMode: "user" 
                    } 
                });

                // Assigne le flux à l'élément <video>
                videoRef.current.srcObject = stream;
                
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    
                    // Ajuste les dimensions réelles après le chargement des métadonnées
                    const actualWidth = videoRef.current!.videoWidth;
                    const actualHeight = videoRef.current!.videoHeight;
                    
                    canvasRef.current!.width = actualWidth;
                    canvasRef.current!.height = actualHeight;
                    setDimensions({ width: actualWidth, height: actualHeight });
                    setIsCameraReady(true);
                    
                    console.log(`Caméra démarrée. Dimensions: ${actualWidth}x${actualHeight}.`);
                    setError(null);
                };

            } catch (err) {
                console.error("Erreur d'accès à la caméra :", err);
                setError("Veuillez autoriser l'accès à la caméra et recharger la page.");
            }
        };

        setupCamera();
        
        // Nettoyage : Arrête la piste vidéo lors du démontage du composant
        return () => {
            const stream = videoRef.current?.srcObject as MediaStream | null;
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    console.log("✅ Caméra prête.");
    return { videoRef, canvasRef, dimensions, isCameraReady, error };
};