import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
//Importar el cargador de GLTF
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';


const SceneCanvas: React.FC = () => {
  // useRef nos permite obtener una referencia al elemento div que contendrá el canvas.
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Este código se ejecuta después de que el componente se monta en el DOM.

    // --- 1. Configuración Básica ---
    const currentMount = mountRef.current; // Accedemos al div referenciado
    if (!currentMount) {
      return; // Salimos si el div no está montado todavía
    }

    // Creamos la escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd); // Color de fondo gris claro

    // Creamos la cámara (PerspectiveCamera simula la visión humana)
    // Parámetros: FOV (campo de visión), Aspect Ratio, Near clip, Far clip
    const camera = new THREE.PerspectiveCamera(
      50, // Campo de visión
      currentMount.clientWidth / currentMount.clientHeight, // Relación de aspecto
      0.1, // Plano cercano
      1000 // Plano lejano
    );
    camera.position.z = 50; // Movemos la cámara hacia atrás para ver el objeto
    camera.position.y = 3; // Movemos la cámara hacia arriba para ver el objeto
    // Creamos el Renderer (WebGL es el más común y potente)
    const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias suaviza los bordes
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight); // Tamaño del canvas


    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Agregamos el canvas generado por el renderer al DOM
    currentMount.appendChild(renderer.domElement);

    // --Añadir luces--
    // Sin luces, los materiales estándar (MeshStandardMaterial, comunes en glTF) se verán negros.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz ambiental suave
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Luz direccional (como el sol)
    directionalLight.position.set(5,10,7.5);
    scene.add(directionalLight);

    ///--- Añadir Controles de orbita-
    // Permiten al usuario rotar, hacer zoom y panea la vista con el ratón/táctil
    const controls = new OrbitControls(camera,renderer.domElement);
    controls.enableDamping = true; // Efecto de desaceleración suave
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // Limita el paneo si quieres
    controls.minDistance = 2; // Zoom mínimo
    controls.maxDistance = 50; // Zoom máximo
    controls.target.set(0, 1, 0); // Hacia dónde mira la cámara (ajusta si tu modelo no está centrado en 0,0,0)

    //---Cargar el Modelo GLTF---

    const loader = new GLTFLoader();
    // El path es relativo a la carpeta `public`
    loader.load(
      '/models/jarra2.glb', // Ruta al modelo GLTF
      (gltf)=>{
        // Se llama cuando el modelo se ha cargado correctamente
        const model = gltf.scene;
        // Opcional: Centrar y escalar el modelo si es necesario
        // (Esto requiere calcular el bounding box, es más avanzado, empezamos simple)
        // model.scale.set(0.5, 0.5, 0.5); // Ejemplo de escalado
        model.position.y = 0; // Ajusta la posición Y para que esté en el suelo
        scene.add(model); // Agregamos el modelo a la escena
        console.log('Modelo cargado:', model);
      },
      (xhr)=>{
        // Se llama mientras la carga está en progreso
        console.log(`${(xhr.loaded / xhr.total * 100).toFixed(2)}% cargado`);
      },
      (error)=>{
        // Se llama si hay un error al cargar el modelo
        console.error('Error al cargar el modelo:', error);
      }
    );

    //----Cucle de Animacion Actualizado
    const animate = () => {
      requestAnimationFrame(animate);
      // Actualizamos los controles (si los tenemos)
      controls.update();
      // Renderizamos la escena
      renderer.render(scene,camera);
    }

    animate(); // Iniciamos el bucle de animación

    // --- 4. Manejo del Redimensionamiento de la Ventana ---
    const handleResize = () => {
      if(!currentMount) return; // Verificamos que el div esté montado
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      // Actualizamos el tamaño del renderer y la cámara
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix(); // Actualizamos la matriz de proyección
    };
    window.addEventListener('resize', handleResize);

    // --- 5. Limpieza al Desmontar el Componente ---
    // Es MUY importante limpiar la escena, el renderer y los event listeners
    // cuando el componente se desmonta para evitar fugas de memoria.
    return () => {
      window.removeEventListener('resize', handleResize); // Limpiamos el event listener
      if(currentMount && renderer.domElement.parentNode) {
        currentMount.removeChild(renderer.domElement); // Limpiamos el canvas del DOM
      }

      //liberar recursos espesificos del loader y controles
      controls.dispose(); // Limpiamos los controles
      // La limpieza de la escena (geometrías, materiales) es más compleja con modelos cargados.
      // Three.js intenta hacer algo de limpieza automática, pero para escenas grandes
      // es bueno implementar un recorrido y dispose manual.
      renderer.dispose();
    };

  }, []); // El array vacío [] asegura que useEffect se ejecute solo una vez (al montar)

  // Renderizamos un div que actuará como contenedor para nuestro canvas de Three.js
  // Le damos estilos para que ocupe un espacio visible.
  return (
<div
      ref={mountRef}
      style={{ width: '100%', height: '600px' }} // Quizás más alto para ver mejor
    />
  );
};

export default SceneCanvas;