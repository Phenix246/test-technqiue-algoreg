import React from 'react';
import { CameraFeed } from './components/CameraFeed';
import FaceLandmarkerDemo from './components/FaceLandmarkerDemo';

function App() {
  const currentInstruction = "🎥 Centrez votre visage dans l'ovale..."; 
          {/*<CameraFeed instruction={currentInstruction} />*/}

  return (
    <div className="App">
      <FaceLandmarkerDemo />
    </div>
  );
}

export default App
