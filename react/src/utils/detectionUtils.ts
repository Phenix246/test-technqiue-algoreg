// src/utils/detectionUtils.ts

// Les fonctions drawConnectors et drawLandmarks sont généralement fournies par MediaPipe.
// Si vous ne les avez pas encore, nous allons utiliser une version simplifiée pour le moment.
// Assurez-vous d'avoir les imports si vous utilisez les fonctions DrawingUtils de MediaPipe.

const DRAWING_CONFIG = {
    LANDMARK_COLOR: '#FF0000', // Rouge pour les points
    TARGET_COLOR: 'rgba(0, 255, 0, 0.5)', // Vert pour la zone cible
    HELP_COLOR: '#FFFFFF', // Blanc pour le texte d'aide
};

/**
 * Calcule les coordonnées X et Y du centre du visage.
 * MediaPipe donne les coordonnées normalisées entre 0 et 1.
 */
const calculateFaceCenter = (landmarks: any, width: number, height: number) => {
    // MediaPipe Landmarker a 478 points. On peut prendre le point 1 (centre du nez) comme référence
    // ou faire une moyenne, mais le point du nez est souvent le plus stable.
    const centerLandmark = landmarks[1]; 
    if (!centerLandmark) return null;

    const centerX = centerLandmark.x * width;
    const centerY = centerLandmark.y * height;

    return { centerX, centerY };
};

/**
 * Dessine les résultats d'analyse (landmarks, connexions) et la zone cible sur le canvas.
 * @param ctx Contexte du canvas.
 * @param results Résultats de la détection (incluant faceLandmarks).
 * @param width Largeur du canvas.
 * @param height Hauteur du canvas.
 */
export const drawDetectionResults = (ctx: CanvasRenderingContext2D, results: any, width: number, height: number) => {
    
    // Effacer le canvas avant de redessiner
    ctx.clearRect(0, 0, width, height);

    if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        
        for (const landmarks of results.faceLandmarks) {
            
            // --- 1. Dessin de la zone cible ---
            const center = calculateFaceCenter(landmarks, width, height);
            
            if (center) {
                // Zone cible (par exemple, un cercle de 150px de diamètre)
                const targetRadius = 75;
                ctx.beginPath();
                ctx.arc(center.centerX, center.centerY, targetRadius, 0, 2 * Math.PI);
                ctx.strokeStyle = DRAWING_CONFIG.TARGET_COLOR;
                ctx.lineWidth = 5;
                ctx.stroke();

                // Texte d'aide (par exemple, "Face OK")
                ctx.fillStyle = DRAWING_CONFIG.HELP_COLOR;
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('CIBLE', center.centerX, center.centerY - targetRadius - 10);
            }

            // --- 2. Dessin des Landmarks (facultatif mais utile pour le debug) ---
            // Vous pouvez utiliser ici les fonctions drawConnectors et drawLandmarks de MediaPipe
            // si vous les avez dans un fichier utility, sinon dessiner simplement les points:
            
            ctx.fillStyle = DRAWING_CONFIG.LANDMARK_COLOR;
            for (const p of landmarks) {
                ctx.beginPath();
                ctx.arc(p.x * width, p.y * height, 2, 0, 2 * Math.PI); // Dessine un petit point
                ctx.fill();
            }
        }
    }
};