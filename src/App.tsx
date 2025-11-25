import React from 'react';
import { CameraFeed } from './components/CameraFeed';

function App() {
  const currentInstruction = "🎥 Centrez votre visage dans l'ovale..."; 
    
  return (
      <CameraFeed instruction={currentInstruction} />
  );
}

export default App
