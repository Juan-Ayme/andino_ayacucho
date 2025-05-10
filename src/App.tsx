import { useState } from 'react'
import './App.css'
import SceneCanvas from './components/SceneCanvas';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mi Tienda de Artesanía 3D (Ayacucho)</h1>
      </header>
      <main>
        <p>Visor 3D:</p>
        <SceneCanvas/>
        {/* Aquí iría el resto de tu contenido de e-commerce */}
      </main>
    </div>
  );
}

export default App
