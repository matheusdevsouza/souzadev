"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const glowRef = useRef<THREE.Mesh | null>(null);
  const extraGlowsRef = useRef<THREE.Mesh[]>([]); 
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (rendererRef.current) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 10);

    const glowVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const glowFragmentShader = `
      uniform float opacity;
      varying vec2 vUv;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        
        float eclipse = 1.0 - smoothstep(0.0, 0.6, dist);
        float innerFade = smoothstep(0.0, 0.3, dist);
      
        vec3 color1 = vec3(0.541, 0.169, 0.886); 
        vec3 color2 = vec3(0.600, 0.196, 0.800); 
      
        float gradientMix = smoothstep(0.0, 0.6, dist);
        vec3 finalColor = mix(color1, color2, gradientMix);
        
        float finalOpacity = eclipse * innerFade * opacity;
        gl_FragColor = vec4(finalColor, finalOpacity);
      }
    `;
    
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        opacity: { value: 0 }, 
      },
      vertexShader: glowVertexShader,
      fragmentShader: glowFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending, 
    });

    const glowGeometry = new THREE.PlaneGeometry(18, 18, 32, 32);
    const mainGlow = new THREE.Mesh(glowGeometry, glowMaterial.clone()); 
    
    mainGlow.position.set(2.5, 0, 0); 
    mainGlow.rotation.z = -Math.PI / 8;
    mainGlow.scale.set(0, 0, 0); 
    
    scene.add(mainGlow);
    glowRef.current = mainGlow;

    const extraGlowConfigs = [
      { pos: new THREE.Vector3(-6, 4, 0), scale: 0.6, opacityBase: 0.15 },
      { pos: new THREE.Vector3(0, -5, 0), scale: 1.2, opacityBase: 0.1 },
      { pos: new THREE.Vector3(5, 5, 0), scale: 0.5, opacityBase: 0.12 },
    ];

    extraGlowsRef.current = extraGlowConfigs.map((config) => {
      const extraMaterial = glowMaterial.clone();
      extraMaterial.uniforms.opacity.value = 0; 
      
      const mesh = new THREE.Mesh(glowGeometry, extraMaterial);
      mesh.position.copy(config.pos);
      mesh.scale.set(0, 0, 0); 
      
      mesh.userData = {
        baseOpacity: config.opacityBase,
        phaseOffset: Math.random() * Math.PI * 2,
        targetScale: config.scale
      };

      scene.add(mesh);
      return mesh;
    });


    const timeline = gsap.timeline({ delay: 0.5 }); 

    timeline.to(mainGlow.scale, {
      x: 1, y: 1, z: 1, duration: 1.5, ease: "power2.out",
    }, "start");
    
    const mainMat = mainGlow.material as THREE.ShaderMaterial;
    timeline.to(mainMat.uniforms.opacity, {
      value: 0.4, duration: 1.5, ease: "power2.out",
    }, "start");

    extraGlowsRef.current.forEach((mesh, index) => {
       const mat = mesh.material as THREE.ShaderMaterial;
       const targetScale = mesh.userData.targetScale;
       
       timeline.to(mesh.scale, {
         x: targetScale, y: targetScale, z: targetScale,
         duration: 2.0,
         ease: "power2.out"
       }, `start+=${0.2 + index * 0.2}`);

       timeline.to(mat.uniforms.opacity, {
         value: mesh.userData.baseOpacity,
         duration: 2.0,
         ease: "power2.out"
       }, `start+=${0.2 + index * 0.2}`);
    });

    const resize = () => {
      if (!canvas) return;
      const { clientWidth, clientHeight } = canvas;
      if (
        canvas.width !== clientWidth ||
        canvas.height !== clientHeight
      ) {
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight || 1;
        camera.updateProjectionMatrix();
      }
    };

    const renderScene = () => {
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      resize();
      renderScene();
    };

    window.addEventListener("resize", handleResize);
    resize();

    let animationFrame: number;
    const animate = () => {
      const time = clockRef.current.getElapsedTime();

      if (glowRef.current) {
        const pulse = 0.3 + (Math.sin(time * 0.8) * 0.5 + 0.5) * 0.2;
        const material = glowRef.current.material as THREE.ShaderMaterial;
        
        if (material.uniforms.opacity.value > 0.05) {
             material.uniforms.opacity.value = THREE.MathUtils.lerp(
                material.uniforms.opacity.value, 
                pulse, 
                0.02
             );
        }

        const scalePulse = 1 + Math.sin(time * 0.3) * 0.05;
        if (!gsap.isTweening(glowRef.current.scale)) {
             glowRef.current.scale.set(scalePulse, scalePulse, scalePulse);
        }

        glowRef.current.rotation.z = -Math.PI / 8 + time * 0.05;
      }

      extraGlowsRef.current.forEach((mesh) => {
         const userData = mesh.userData;
         const mat = mesh.material as THREE.ShaderMaterial;
         
         const pulseFactor = Math.sin(time * 0.5 + userData.phaseOffset);
         const targetOpacity = userData.baseOpacity + (pulseFactor * (userData.baseOpacity * 0.3));
         
         if (mat.uniforms.opacity.value > 0.01) {
            mat.uniforms.opacity.value = THREE.MathUtils.lerp(mat.uniforms.opacity.value, targetOpacity, 0.01);
         }
         
         mesh.rotation.z = time * 0.03 + userData.phaseOffset;
      });

      renderScene();
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      glowGeometry.dispose();
      glowMaterial.dispose(); 
      
      if (glowRef.current) {
        const m = glowRef.current.material as THREE.Material;
        m.dispose();
      }
      extraGlowsRef.current.forEach(mesh => {
         const m = mesh.material as THREE.Material;
         m.dispose();
      });
      
      renderer.forceContextLoss();
      renderer.dispose();
      rendererRef.current = null;
      
      if (glowRef.current) {
        gsap.killTweensOf(glowRef.current.scale);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />;
}
