import { useEffect, useRef } from 'react';
import { drawDetectionResults } from '../utils/detectionUtils';

import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

// Import des types MediaPipe (Assumant qu'ils sont définis dans votre projet ou sont des types génériques)
// Pour une intégration TypeScript complète, ces types devraient venir du bundle MediaPipe.
// Nous utilisons ici 'any' pour la simplicité, mais utilisez les types réels si disponibles.
type FaceLandmarkerType = any; 
type VideoElement = HTMLVideoElement | null;
type CanvasElement = HTMLCanvasElement | null;

interface FaceDetectionProps {
    faceLandmarker: FaceLandmarkerType;
    videoRef: React.RefObject<VideoElement>;
    canvasRef: React.RefObject<CanvasElement>;
    isLandmarkerReady: boolean;
    isRunning: boolean;
}

/**
 * Hook responsable de l'analyse en temps réel du flux vidéo 
 * et du dessin des résultats sur le canvas.
 */
export const useFaceDetection = ({ 
    faceLandmarker, 
    videoRef, 
    canvasRef, 
    isLandmarkerReady, 
    isRunning 
}: FaceDetectionProps) => {

    // Réf pour stocker l'ID de la boucle d'animation
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        if (!isLandmarkerReady || !isRunning || !faceLandmarker) {
            console.log("Analyse pas prête")
            // Arrêter l'analyse si le Landmarker n'est pas prêt ou si l'analyse est désactivée
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
            return;
        }
        console.log("Action face detection")

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const drawingUtils = new DrawingUtils(ctx);

        if (!video || !canvas || !ctx) {
            console.error("Éléments vidéo ou canvas introuvables.");
            return;
        }

        // --- Détection en Boucle (Request Animation Frame) ---

        const detectFaces = async () => {
            console.log("detectFaces()", video.paused, video.ended)
            if (!video.paused && !video.ended) {
                
                // 1. Analyse du visage
                const results = faceLandmarker.detectForVideo(video, performance.now());
                console.log(results);

                // 2. Préparation du dessin
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // 3. Dessin des résultats et de la zone cible
                if (results) {
                    for (const landmarks of results.faceLandmarks) {
                        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
                        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0" });

                    }
                    // TODO: Intégrer la logique de dessin de la zone cible et des landmarks.
                    // Pour l'instant, nous appelons une fonction vide.
                    //drawResults(ctx, results, canvas.width, canvas.height, drawingUtils)
                    //drawDetectionResults(ctx, results, canvas.width, canvas.height); 
                }

                // 4. Boucle
                
            }
            animationFrameId.current = requestAnimationFrame(detectFaces);
        };

        // Démarrer la boucle d'analyse
        animationFrameId.current = requestAnimationFrame(detectFaces);

        // --- Fonction de Nettoyage ---
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };

    }, [isLandmarkerReady, isRunning, faceLandmarker, videoRef, canvasRef]);
};


// --- Fonction de dessin (à déplacer ou implémenter dans un fichier utils) ---

/**
 * Dessine les landmarks et les connections. 
 * Cette fonction sera le point où vous intègrerez la logique de "mise en valeur de la rotation".
 */
const drawResults = (ctx: CanvasRenderingContext2D, results: any, width: number, height: number, drawingUtils: DrawingUtils) => {
    
    // Assurez-vous d'avoir les fonctions drawConnectors et drawLandmarks (nous les avions mentionnées plus tôt)
    // Nous les laissons ici comme placeholder
    
    for (const landmarks of results.faceLandmarks) {
        // Dessin des connecteurs (traits du visage)
        // drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
        
        // Dessin des points clés (landmarks)
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0" });

         //drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
    }

    // TODO: Dessiner un cercle ou un rectangle cible au centre pour le liveness check.
};