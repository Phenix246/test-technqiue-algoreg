import { Component, 
  ElementRef, 
  OnInit, 
  ViewChild, 
  signal, 
  NgZone 
} from '@angular/core';
import { 
  FilesetResolver, 
  FaceLandmarker, 
  FaceLandmarkerOptions, 
  DrawingUtils, 
  FaceLandmarkerResult 
} from '@mediapipe/tasks-vision';
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('algoreg');

  @ViewChild('webcamRef') webcamElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasRef') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('instructionRef') instructionElement!: ElementRef<HTMLSpanElement>;

  private faceLandmarker!: FaceLandmarker;
  private runningMode: 'VIDEO' | 'IMAGE' = 'VIDEO';
  private canvasCtx!: CanvasRenderingContext2D;
  private drawingUtils!: DrawingUtils;

  private readonly MIN_DETECTION_INTERVAL = 20;
  private lastDetectionTime = 0;

  constructor(private ngZone: NgZone) {}

  async ngOnInit(): Promise<void> {
    await this.initialiserFaceLandmarker();

    this.initialiserWebcam();
  }

  async initialiserFaceLandmarker(): Promise<void> {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const options: FaceLandmarkerOptions = {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "CPU" 
      },
      runningMode: this.runningMode,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      numFaces: 1
    };
    
    this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, options);
    console.log("FaceLandmarker initialisé.");
  }

  initialiserWebcam(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream: MediaStream) => {
          if (this.webcamElement && this.webcamElement.nativeElement) {
            const video = this.webcamElement.nativeElement;
            video.srcObject = stream;
            
            video.onloadeddata = () => {
              // S'assurer que le canvas a la même taille que la vidéo
              this.canvasElement.nativeElement.width = video.videoWidth;
              this.canvasElement.nativeElement.height = video.videoHeight;
              
              this.canvasCtx = this.canvasElement.nativeElement.getContext('2d')!;
              this.drawingUtils = new DrawingUtils(this.canvasCtx);
              
              this.ngZone.runOutsideAngular(() => this.predictWebcam());
            };
          }
        })
        .catch((err) => {
          console.error("Erreur lors de l'accès à la webcam :", err);
        });
    }
  }

predictWebcam(): void {
    const video = this.webcamElement.nativeElement;
    let results: FaceLandmarkerResult | undefined;

    // Calculer le temps écoulé si la vidéo est en mode 'VIDEO'
    if (this.runningMode === 'VIDEO' && !video.paused && video.readyState >= 2) {        
        const nowInMs = performance.now();

        if (nowInMs - this.lastDetectionTime >= this.MIN_DETECTION_INTERVAL) {
            
            try {
                results = this.faceLandmarker.detectForVideo(video, nowInMs);
                
                this.lastDetectionTime = nowInMs; 

            } catch (e) {
                // Erreur WASM attrapée. Imposer un long délai avant de réessayer.
                console.error("Erreur d'inférence MediaPipe ignorée (WASM) :", e);
                this.lastDetectionTime = nowInMs + 500; 
            }
        }
    }
    
    this.canvasCtx.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);

    if (results && results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
            //this.drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
            this.drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0" });
        } 

        this.drawBldrawMatrixes(results.facialTransformationMatrixes);
    }

    window.requestAnimationFrame(() => this.predictWebcam());
  }

  left: String|null = "";
  center: String|null = ""
  right: String|null = ""
  down: String|null = ""
  up: String|null = ""

  drawBldrawMatrixes(facialTransformationMatrixes: FaceLandmarkerResult["facialTransformationMatrixes"]) {
    if (!facialTransformationMatrixes.length) {
        return;
    }
    const matrix4x4 = facialTransformationMatrixes[0].data;
    const R_flat = [
        matrix4x4[0], matrix4x4[1], matrix4x4[2],
        matrix4x4[4], matrix4x4[5], matrix4x4[6],
        matrix4x4[8], matrix4x4[9], matrix4x4[10]
    ];


    const angles_rad = this.matrixToEulerAngles(R_flat);

    const yaw = this.radiansToDegrees(angles_rad.yaw);
    const pitch = this.radiansToDegrees(angles_rad.pitch);

    if(this.center === "" && pitch > -5 && pitch < 5) {
      this.center = this.captureFrame()
      this.instructionElement.nativeElement.innerHTML = this.determinerInstruction()
      console.log(this.center)
    }  else if (this.left === "" && pitch < -25) {
      this.left = this.captureFrame()
      this.instructionElement.nativeElement.innerHTML = this.determinerInstruction()
      console.log(this.left)
    } else if (this.right === "" && pitch > 25) {
      this.right = this.captureFrame()
      this.instructionElement.nativeElement.innerHTML = this.determinerInstruction()
      console.log(this.right)
    } else if (this.up === "" && pitch > -5 && pitch < 5 && yaw > 25) {
      this.up = this.captureFrame()
      this.instructionElement.nativeElement.innerHTML = this.determinerInstruction()
      console.log(this.up)
    } else if (this.down === "" && pitch > -5 && pitch < 5 && yaw < -25) {
      this.down = this.captureFrame()
      this.instructionElement.nativeElement.innerHTML = this.determinerInstruction()
      console.log(this.down)
    }
}

matrixToEulerAngles(R: any) {
    // Les indices de la matrice 3x3 dans un tableau plat :
    // [ R00, R01, R02,
    //   R10, R11, R12,
    //   R20, R21, R22 ]
    
    // R20 est l'élément qui nous donne l'angle de Pitch.
    const R20 = R[6];
    
    // Pitch (Rotation autour de l'axe X)
    // Nous utilisons asin(-R20) pour éviter le Gimbal Lock pour la plupart des mouvements.
    let pitch = -Math.asin(R20);
    
    // Gestion de la Singularité (Gimbal Lock) :
    // Si la tête est tournée de +/- 90 degrés (Pitch), la cos(Pitch) est ~0.
    const threshold = 0.000001;
    const cosPitch = Math.cos(pitch);

    let yaw, roll;

    if (Math.abs(cosPitch) > threshold) {
        // Yaw (Rotation autour de l'axe Y - Roulis de la tête)
        yaw = Math.atan2(R[7] / cosPitch, R[8] / cosPitch); // atan2(R21/c(P), R22/c(P))
        
        // Roll (Rotation autour de l'axe Z - Inclinaison latérale)
        roll = Math.atan2(R[3] / cosPitch, R[0] / cosPitch); // atan2(R10/c(P), R00/c(P))
    } else {
        // Cas de singularité (Pitch +/- 90 degrés)
        // Nous choisissons une valeur arbitraire (souvent 0) pour l'un des angles (ici Roll)
        roll = 0; 
        
        // Le Yaw est calculé comme la somme/différence des deux rotations restantes
        yaw = Math.atan2(R[1], R[4]); // atan2(R01, R11)
        
        // Ajustement du signe si Pitch est à -90 degrés (R20 = 1)
        if (R20 > 0) {
            yaw = Math.atan2(-R[1], -R[4]);
        }
    }
    
    return { yaw, pitch, roll };
  }

  // Fonction utilitaire pour convertir en degrés
  radiansToDegrees(radians: number) {
      return radians * (180 / Math.PI);
  }

  captureFrame() {
    // 1. Récupérer les éléments
    const outputImage = document.getElementById('outputImage');

    if (!this.webcamElement || !this.canvasElement) {
        console.error("Éléments vidéo ou canvas introuvables.");
        return null;
    }

    // S'assurer que la vidéo est chargée
    if (this.webcamElement.nativeElement.readyState < 2) { 
        console.warn("La vidéo n'est pas prête.");
        return null;
    }

    // 2. Définir les dimensions du canvas
    // Il est important que le canvas ait les mêmes dimensions que la vidéo
    this.canvasElement.nativeElement.width = this.webcamElement.nativeElement.videoWidth;
    this.canvasElement.nativeElement.height = this.webcamElement.nativeElement.videoHeight;

    // 3. Dessiner l'image actuelle de la vidéo sur le canvas
    const context = this.canvasElement.nativeElement.getContext('2d');
    if (context) {
        // Dessine l'image (frame) actuelle de la vidéo, du coin (0,0) jusqu'à la taille complète.
        context.drawImage(this.webcamElement.nativeElement, 0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);

        // 4. Extraire les données de l'image (format Data URL)
        // 'image/jpeg' ou 'image/png' sont les formats les plus courants
        const imageDataUrl = this.canvasElement.nativeElement.toDataURL('image/jpeg', 0.9); // 0.9 pour la qualité JPEG
        
        return imageDataUrl;
    }

    return null;
  }

  determinerInstruction(): string {
    if(!this.center) {
      return "Centrer votre visage";
    }
    if(!this.left) {
      return "tourner le visage à gauche";
    }
    if(!this.right) {
      return "Tourner le visage à droite";
    }
    if(!this.up) {
      return "Centrer votre visage puis regarder vers le haut";
    }
    if(!this.down) {
      return "Centrer votre visage puis regarder vers le bas";
    }
    return "Merci, nous traitons vos informations";
  }
}
