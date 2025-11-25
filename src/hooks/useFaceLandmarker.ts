import { useState, useEffect } from 'react';

// Nous utilisons l'import dynamique pour obtenir les classes
// La librairie NPM est utilisée, ce qui résout le problème MIME Type.
const MEDIA_PIPE_TASKS = '@mediapipe/tasks-vision';

// Le chemin WASM doit pointer vers l'emplacement dans node_modules
// Cette URL est souvent le point faible. Nous utilisons le chemin standard recommandé pour les bundles.
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"; 
// On garde cette URL car elle est servie avec le bon MIME Type et ne dépend pas du système de fichiers local.

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";


interface FaceLandmarkerHookResult {
    faceLandmarker: FaceLandmarker | null;
    isLandmarkerReady: boolean;
    landmarkerError: string | null;
}

export const useFaceLandmarker = () => {
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [isLandmarkerReady, setIsLandmarkerReady] = useState(false);
    const [landmarkerError, setLandmarkerError] = useState(null);

    useEffect(() => {
        const loadLandmarker = async () => {
            try {
                // Importation dynamique pour obtenir l'objet complet de MediaPipe
                const mpVision = await import(MEDIA_PIPE_TASKS);
                
                // Utilisation des classes importées
                const FilesetResolver = mpVision.FilesetResolver;
                const FaceLandmarker = mpVision.FaceLandmarker;
                const VisionRunningMode = mpVision.VisionRunningMode;
                
                // 1. Initialiser le Resolver
                const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);

                // 2. Créer l'objet FaceLandmarker
                const landmarker = await FaceLandmarker.create(filesetResolver, {
                    baseOptions: { modelAssetPath: MODEL_URL },
                    runningMode: VisionRunningMode.VIDEO, 
                    numFaces: 1
                });
                
                setFaceLandmarker(landmarker);
                setIsLandmarkerReady(true);
                console.log("✅ Modèle MediaPipe chargé via Import Dynamique NPM.");

            } catch (err) {
                console.error("Erreur lors du chargement de MediaPipe (Import Dynamique) :", err);
                setLandmarkerError("Impossible de charger le modèle de reconnaissance faciale.");
            }
        };

        loadLandmarker();

    }, []);

    return { faceLandmarker, isLandmarkerReady, landmarkerError };
};