"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

interface HeroPlanetProps {
  onInteractionEnd?: () => void;
}

export function HeroPlanet({ onInteractionEnd }: HeroPlanetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planetContainerRef = useRef<THREE.Group | null>(null);
  const planetModelRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const isLoadedRef = useRef(false);
  const isInteractingRef = useRef(false);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResettingRef = useRef(false);
  const rotationCorrectionRef = useRef(0);

  const INITIAL_CAMERA_POS = new THREE.Vector3(0, 0.8, 7.5);
  const NOTEBOOK_TARGET = new THREE.Vector3(1.2, 0.3, 0); 

  useEffect(() => {
    if (!containerRef.current || rendererRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null; 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60, 
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.copy(INITIAL_CAMERA_POS);
    camera.lookAt(NOTEBOOK_TARGET); 
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "default",
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = false; 
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.target.copy(NOTEBOOK_TARGET);
    controlsRef.current = controls;

    const handleStart = () => {
      isInteractingRef.current = true;
      isResettingRef.current = false;
      rotationCorrectionRef.current = 0; 
      
      gsap.killTweensOf(camera.position);
      if (planetModelRef.current) {
      }
    };

    const handleEnd = () => {
      isInteractingRef.current = false;
      isResettingRef.current = true;

      // Trigger noise transition IMEDIATAMENTE quando o usuário larga o notebook
      onInteractionEnd?.();

      const targetDistance = INITIAL_CAMERA_POS.distanceTo(NOTEBOOK_TARGET);
      
      gsap.to(camera.position, {
        x: INITIAL_CAMERA_POS.x,
        y: INITIAL_CAMERA_POS.y,
        z: INITIAL_CAMERA_POS.z,
        duration: 2.5, 
        ease: "power2.out", 
        onUpdate: () => {
          const direction = new THREE.Vector3().subVectors(camera.position, NOTEBOOK_TARGET);
          
          direction.normalize().multiplyScalar(targetDistance);
          
          camera.position.copy(NOTEBOOK_TARGET).add(direction);
          
          camera.lookAt(NOTEBOOK_TARGET);
        },
        onComplete: () => {
          isResettingRef.current = false;
        }
      });

      if (planetModelRef.current) {
        const currentRot = planetModelRef.current.rotation.y;
        const targetRot = Math.round(currentRot / (Math.PI * 2)) * (Math.PI * 2);
        rotationCorrectionRef.current = targetRot - currentRot;
      }
    };

    controls.addEventListener("start", handleStart);
    controls.addEventListener("end", handleEnd);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-5, -3, -5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x888888, 0.5);
    scene.add(hemisphereLight);

    const loader = new GLTFLoader();
    loader.load(
      "/apple_macbook_air_15_space_gray_2023.glb",
      (gltf) => {
        const planetModel = gltf.scene;
        planetModelRef.current = planetModel;

        planetModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.computeVertexNormals();
            
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.metalness = 0.3;
              child.material.roughness = 0.4;
              child.material.envMapIntensity = 1.2;
            }
            
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        const planetContainer = new THREE.Group();
        planetContainerRef.current = planetContainer;

        const box = new THREE.Box3().setFromObject(planetModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.8 / maxDim; 
        
        planetModel.scale.set(scale, scale, scale);
        
        planetModel.position.set(0, 0, 0);
        planetModel.position.sub(center.multiplyScalar(scale));
        
        planetContainer.add(planetModel);
        
        planetContainer.position.set(1.2, 0.3, 0); 
        
        planetContainer.rotation.x = 0.15; 
        planetContainer.rotation.y = Math.PI / 4; 
        planetContainer.scale.set(0, 0, 0); 

        scene.add(planetContainer);

        const timeline = gsap.timeline({
          onComplete: () => {
            isLoadedRef.current = true;
          }
        });

        timeline.to(planetContainer.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.5,
          ease: "back.out(1.2)", 
        });

        const targetRotationY = -Math.PI / 5;
        
        timeline.to(planetContainer.rotation, {
          y: targetRotationY,
          duration: 1.5,
          ease: "power3.out", 
        }, "<"); 

        const rotationSpeedObj = { value: 0 };
        timeline.to(rotationSpeedObj, {
          value: -0.002, 
          duration: 0.8,
          ease: "power1.in", 
          onUpdate: () => {
            if (planetModel) {
              planetModel.rotation.y += rotationSpeedObj.value;
            }
          },
          onComplete: () => {
          }
        }, "-=0.8"); 

      },
      (progress) => {
      },
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const time = clockRef.current.elapsedTime;

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (planetContainerRef.current) {
        const baseY = 0.3; 
        planetContainerRef.current.position.y = baseY + Math.sin(time * 0.5) * 0.08;
      }

      if (planetModelRef.current && isLoadedRef.current && !isInteractingRef.current) {
        const correctionVelocity = rotationCorrectionRef.current * 0.02; 
        
        planetModelRef.current.rotation.y += -0.002 + correctionVelocity;
        
        rotationCorrectionRef.current -= correctionVelocity;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      
      if (controlsRef.current) {
        controlsRef.current.removeEventListener("start", handleStart);
        controlsRef.current.removeEventListener("end", handleEnd);
        controlsRef.current.dispose();
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.forceContextLoss();
        rendererRef.current.dispose();
        rendererRef.current = null;
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      gsap.killTweensOf(camera.position);
      if (planetContainerRef.current) {
         gsap.killTweensOf(planetContainerRef.current);
         gsap.killTweensOf(planetContainerRef.current.scale);
         gsap.killTweensOf(planetContainerRef.current.rotation);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-grab active:cursor-grabbing" 
      style={{ minHeight: "500px", overflow: "hidden" }}
    />
  );
}
