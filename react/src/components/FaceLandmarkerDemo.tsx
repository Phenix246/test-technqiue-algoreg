// src/FaceLandmarkerDemo.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FaceLandmarkerDemo.css';

import { 
    FaceLandmarker, 
    FilesetResolver, 
    DrawingUtils, 
} from "@mediapipe/tasks-vision";

import type {
    FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

// --- Définitions de Types TS ---

// Type pour les données des angles (Pitch, Yaw, Roll)
interface AngleData {
    name: 'yaw' | 'pitch' | 'roll';
    value: number;
}

// Type pour l'état des frames capturées
interface CapturedFrames {
    left: string | null;
    center: string | null;
    right: string | null;
}

const videoWidth = 480;

// --- Fonctions utilitaires (non modifiées, mais incluses pour la complétude TSX) ---

const radiansToDegrees = (radians: number): number => radians * (180 / Math.PI);

const matrixToEulerAngles = (R: number[]): { yaw: number, pitch: number, roll: number } => {
    // Assumons que R est un tableau plat de 9 éléments pour la matrice de rotation 3x3
    const R20 = R[6];
    let pitch = -Math.asin(R20);
    const threshold = 0.000001;
    const cosPitch = Math.cos(pitch);
    let yaw, roll;

    if (Math.abs(cosPitch) > threshold) {
        yaw = Math.atan2(R[7] / cosPitch, R[8] / cosPitch);
        roll = Math.atan2(R[3] / cosPitch, R[0] / cosPitch);
    } else {
        roll = 0; 
        yaw = Math.atan2(R[1], R[4]);
        if (R20 > 0) {
            yaw = Math.atan2(-R[1], -R[4]);
        }
    }
    return { yaw, pitch, roll };
};


const FaceLandmarkerDemo: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
    const [matrixesData, setMatrixesData] = useState<AngleData[]>([]);
    const [capturedFrames, setCapturedFrames] = useState<CapturedFrames>({ left: null, center: null, right: null });

    // Références typées
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const drawingUtilsRef = useRef<DrawingUtils | null>(null);
    const runningModeRef = useRef<"IMAGE" | "VIDEO">("IMAGE");
    const lastVideoTimeRef = useRef<number>(-1);

    // Initialisation de FaceLandmarker
    useEffect(() => {
        const createLandmarker = async () => {
            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            
            faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU" // Commenté si l'on rencontre des problèmes d'environnement
                },
                outputFaceBlendshapes: false,
                outputFacialTransformationMatrixes: true,
                runningMode: runningModeRef.current,
                numFaces: 1
            });

            setIsLoaded(true);
        };
        createLandmarker();
    }, []);

    // Fonction pour capturer la frame de la vidéo
    const captureFrame = useCallback((): string | null => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas || video.readyState < 2) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (context) {
            // Dessine l'image de la vidéo sur le canvas (pour l'extraction)
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Réinitialise le canvas pour le dessin des landmarker (important !)
            context.clearRect(0, 0, canvas.width, canvas.height); 
            return canvas.toDataURL('image/jpeg', 0.9);
        }
        return null;
    }, []);

    // Traitement des résultats de détection
    const processResults = useCallback((results: FaceLandmarkerResult) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasCtx = canvas.getContext("2d");
        const drawingUtils = drawingUtilsRef.current;

        if (!canvasCtx || !drawingUtils) return;

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.faceLandmarks) {
            for (const landmarks of results.faceLandmarks) {
                // Tesselation
                drawingUtils.drawConnectors(
                    landmarks, 
                    FaceLandmarker.FACE_LANDMARKS_TESSELATION, 
                    { color: "#C0C0C070", lineWidth: 1 }
                );
                // Ovale du visage
                drawingUtils.drawConnectors(
                    landmarks, 
                    FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, 
                    { color: "#E0E0E0" }
                );
            }
        }
        
        // --- Traitement de Matrixes (Yaw, Pitch, Roll) ---
        if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
            const matrix4x4 = results.facialTransformationMatrixes[0].data;
            // Extrait les 9 éléments 3x3 de la matrice de rotation de la matrice 4x4
            const R_flat = [
                matrix4x4[0], matrix4x4[1], matrix4x4[2],
                matrix4x4[4], matrix4x4[5], matrix4x4[6],
                matrix4x4[8], matrix4x4[9], matrix4x4[10]
            ];

            const angles_rad = matrixToEulerAngles(R_flat);
            const yaw = radiansToDegrees(angles_rad.yaw);
            const pitch = radiansToDegrees(angles_rad.pitch);
            const roll = radiansToDegrees(angles_rad.roll);

            const data: AngleData[] = [
                { name: "yaw", value: yaw },
                { name: "pitch", value: pitch },
                { name: "roll", value: roll }
            ];
            setMatrixesData(data);

            // Logique de capture de frame basée sur le Pitch (basé sur le code JS original)
            setCapturedFrames(prevFrames => {
                const newFrames: CapturedFrames = { ...prevFrames };
                
                if (pitch !== undefined && typeof(pitch) === 'number') {
                    const frame = captureFrame();

                    if (frame) {
                        // Capture de face
                        if (newFrames.center === null && pitch > -5 && pitch < 5) {
                            newFrames.center = frame;
                        // Capture de profil droit (tête tournée vers la gauche de l'utilisateur)
                        } else if (newFrames.left === null && pitch < -25) { 
                            newFrames.left = frame;
                        // Capture de profil gauche (tête tournée vers la droite de l'utilisateur)
                        } else if (newFrames.right === null && pitch > 25) {
                            newFrames.right = frame;
                        }
                    }
                }
                return newFrames;
            });
        }

    }, [captureFrame]);

    // Fonction de prédiction récursive
    const predictWebcam = useCallback(async () => {
        const landmarker = faceLandmarkerRef.current;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!landmarker || !video || !canvas || !webcamRunning) {
            return;
        }

        // --- Configuration du Canvas/Vidéo ---
        const radio = video.videoHeight / video.videoWidth;
        const zoom = 1.5;
        const adjustedWidth = zoom * videoWidth;
        const adjustedHeight = zoom * videoWidth * radio;

        // Assurez-vous que les styles sont corrects pour le positionnement
        video.style.width = `${adjustedWidth}px`;
        video.style.height = `${adjustedHeight}px`;
        canvas.style.width = `${adjustedWidth}px`;
        canvas.style.height = `${adjustedHeight}px`;
        canvas.width = zoom * video.videoWidth;
        canvas.height = zoom * video.videoHeight;

        // Initialisation de DrawingUtils
        if (!drawingUtilsRef.current) {
            const context = canvas.getContext("2d");
            if (context) {
                drawingUtilsRef.current = new DrawingUtils(context);
            } else {
                return;
            }
        }
        
        // --- Détection ---
        if (runningModeRef.current === "IMAGE") {
            runningModeRef.current = "VIDEO";
            await landmarker.setOptions({ runningMode: runningModeRef.current });
            lastVideoTimeRef.current = -1;
        }

        let results: FaceLandmarkerResult | undefined = undefined;
        let startTimeMs = performance.now();

        if (lastVideoTimeRef.current !== video.currentTime) {
            lastVideoTimeRef.current = video.currentTime;
        
            // Utiliser le currentTime de la vidéo comme horodatage est la méthode standard.
            // On multiplie par 1000 pour convertir les secondes en millisecondes.
            const timestampMs = Math.floor(video.currentTime * 1000); 

            // Utilisez la méthode detectForVideo
            results = landmarker.detectForVideo(video, timestampMs);
        }

        if (results) {
            processResults(results);
        }

        // Boucle de prédiction
        if (webcamRunning) {
            window.requestAnimationFrame(predictWebcam);
        }
    }, [webcamRunning, processResults]);


    // Activation/Désactivation de la caméra
    const enableCam = () => {
        if (!isLoaded) {
            console.log("Attendez ! FaceLandmarker n'est pas encore chargé.");
            return;
        }

        if (webcamRunning) {
            // Désactivation
            const stream = videoRef.current?.srcObject as MediaStream;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setWebcamRunning(false);
            return;
        }

        // Activation
        const constraints: MediaStreamConstraints = { video: true };
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream: MediaStream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setWebcamRunning(true);
                }
            })
            .catch((error: Error) => {
                console.error("Erreur d'accès à la webcam:", error);
                setWebcamRunning(false);
            });
    };

    // Lancement de la boucle de prédiction après le chargement de la vidéo
    useEffect(() => {
        if (webcamRunning && videoRef.current) {
            const video = videoRef.current;
            const handleLoadedData = () => {
                video.removeEventListener("loadeddata", handleLoadedData);
                predictWebcam();
            };
            video.addEventListener("loadeddata", handleLoadedData);
            return () => video.removeEventListener("loadeddata", handleLoadedData);
        }
    }, [webcamRunning, predictWebcam]);


    return (
        <div className="FaceLandmarkerDemo">
            <h1>Détection de repères faciaux avec MediaPipe FaceLandmarker (TSX)</h1>
            <hr />

            <section id="demos" className={isLoaded ? '' : 'invisible'}>
                <h2>Démo : Détection continue via Webcam</h2>
                <p>Placez votre visage devant la webcam pour obtenir la détection des repères en temps réel.<br />Cliquez sur **{webcamRunning ? "DÉSACTIVER CAM" : "ACTIVER CAM"}**.</p>

                <div id="liveView" className="videoView">
                    <button 
                        id="webcamButton" 
                        className="mdc-button mdc-button--raised" 
                        onClick={enableCam}
                        disabled={!isLoaded}
                    >
                        {webcamRunning ? "DÉSACTIVER CAM" : "ACTIVER CAM"}
                    </button>
                    <div style={{ position: 'relative' }}>
                        <video ref={videoRef} id="webcam" className="video-element" autoPlay playsInline></video> 
                        <canvas 
                            ref={canvasRef} 
                            className="output_canvas canvas" 
                            id="output_canvas" 
                            style={{ position: 'absolute', left: 0, top: 0 }}
                        ></canvas>
                    </div>
                </div>

                {/* Affichage des Angles (Matrixes) */}
                <div className="blend-shapes">
                    <h3>Angles de Rotation de la Tête (en degrés)</h3>
                    <ul className="blend-shapes-list" id="video-blend-shapes">
                        {matrixesData.map((shape) => (
                            <li key={shape.name} className="blend-shapes-item">
                                <span className="blend-shapes-label">{shape.name.toUpperCase()}</span>
                                <span className="">{(+shape.value).toFixed(4)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
            
            <hr />

            <h3>📸 Captures de Pose (basées sur l'angle de Pitch)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Gauche (Pitch &lt; -25°)</th>
                        <th>Centre (-5° &lt; Pitch &lt; 5°)</th>
                        <th>Droite (Pitch &gt; 25°)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            {capturedFrames.left ? (
                                <img width="300px" alt="Left Pose" src={capturedFrames.left} />
                            ) : (
                                <p>Tournez à gauche pour capturer</p>
                            )}
                        </td>
                        <td>
                            {capturedFrames.center ? (
                                <img width="300px" alt="Center Pose" src={capturedFrames.center} />
                            ) : (
                                <p>Gardez la tête droite pour capturer</p>
                            )}
                        </td>
                        <td>
                            {capturedFrames.right ? (
                                <img width="300px" alt="Right Pose" src={capturedFrames.right} />
                            ) : (
                                <p>Tournez à droite pour capturer</p>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default FaceLandmarkerDemo;