"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

// Noise shader code
const noiseShader = `
//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec4 fade(vec4 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec4 P){
  vec4 Pi0 = floor(P); // Integer part for indexing
  vec4 Pi1 = Pi0 + 1.0; // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec4 Pf0 = fract(P); // Fractional part for interpolation
  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = vec4(Pi0.zzzz);
  vec4 iz1 = vec4(Pi1.zzzz);
  vec4 iw0 = vec4(Pi0.wwww);
  vec4 iw1 = vec4(Pi1.wwww);

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 ixy00 = permute(ixy0 + iw0);
  vec4 ixy01 = permute(ixy0 + iw1);
  vec4 ixy10 = permute(ixy1 + iw0);
  vec4 ixy11 = permute(ixy1 + iw1);

  vec4 gx00 = ixy00 / 7.0;
  vec4 gy00 = floor(gx00) / 7.0;
  vec4 gz00 = floor(gy00) / 6.0;
  gx00 = fract(gx00) - 0.5;
  gy00 = fract(gy00) - 0.5;
  gz00 = fract(gz00) - 0.5;
  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
  vec4 sw00 = step(gw00, vec4(0.0));
  gx00 -= sw00 * (step(0.0, gx00) - 0.5);
  gy00 -= sw00 * (step(0.0, gy00) - 0.5);

  vec4 gx01 = ixy01 / 7.0;
  vec4 gy01 = floor(gx01) / 7.0;
  vec4 gz01 = floor(gy01) / 6.0;
  gx01 = fract(gx01) - 0.5;
  gy01 = fract(gy01) - 0.5;
  gz01 = fract(gz01) - 0.5;
  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
  vec4 sw01 = step(gw01, vec4(0.0));
  gx01 -= sw01 * (step(0.0, gx01) - 0.5);
  gy01 -= sw01 * (step(0.0, gy01) - 0.5);

  vec4 gx10 = ixy10 / 7.0;
  vec4 gy10 = floor(gx10) / 7.0;
  vec4 gz10 = floor(gy10) / 6.0;
  gx10 = fract(gx10) - 0.5;
  gy10 = fract(gy10) - 0.5;
  gz10 = fract(gz10) - 0.5;
  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
  vec4 sw10 = step(gw10, vec4(0.0));
  gx10 -= sw10 * (step(0.0, gx10) - 0.5);
  gy10 -= sw10 * (step(0.0, gy10) - 0.5);

  vec4 gx11 = ixy11 / 7.0;
  vec4 gy11 = floor(gx11) / 7.0;
  vec4 gz11 = floor(gy11) / 6.0;
  gx11 = fract(gx11) - 0.5;
  gy11 = fract(gy11) - 0.5;
  gz11 = fract(gz11) - 0.5;
  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
  vec4 sw11 = step(gw11, vec4(0.0));
  gx11 -= sw11 * (step(0.0, gx11) - 0.5);
  gy11 -= sw11 * (step(0.0, gy11) - 0.5);

  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
  g0000 *= norm00.x;
  g0100 *= norm00.y;
  g1000 *= norm00.z;
  g1100 *= norm00.w;

  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
  g0001 *= norm01.x;
  g0101 *= norm01.y;
  g1001 *= norm01.z;
  g1101 *= norm01.w;

  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
  g0010 *= norm10.x;
  g0110 *= norm10.y;
  g1010 *= norm10.z;
  g1110 *= norm10.w;

  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
  g0011 *= norm11.x;
  g0111 *= norm11.y;
  g1011 *= norm11.z;
  g1111 *= norm11.w;

  float n0000 = dot(g0000, Pf0);
  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
  float n1111 = dot(g1111, Pf1);

  vec4 fade_xyzw = fade(Pf0);
  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
  return 2.2 * n_xyzw;
}
`;

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform float u_progress;
  uniform float u_aspect;
  uniform vec3 u_color;

  varying vec2 vUv;

  #define PI 3.14159265

  ${noiseShader}

  void main() {
    vec2 newUv = (vUv - vec2(0.5)) * vec2(u_aspect, 1.);
    
    float dist = length(newUv);

    // Otimizar: reduzir cálculos quando não há transição
    bool isTransitioning = u_progress > 0.01;
    
    // Pular cálculos pesados quando não há transição e está longe das bordas
    float normalizedDist = dist / 1.5;
    normalizedDist = clamp(normalizedDist, 0.0, 1.0);
    bool isNearEdge = normalizedDist > 0.5;
    
    // Early return para melhor performance
    if (!isTransitioning && !isNearEdge) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }
    
    float density = 1.8 - dist;
    // Reduzir escala do noise para melhor performance
    float noiseScale = isTransitioning ? 30.0 : 18.0;
    // Reduzir dimensões do noise (usar menos dimensões)
    float noise = cnoise(vec4(newUv * noiseScale * density, u_time * 0.3, 0.0));
    
    // Simplificar grain quando não há transição
    float grain = isTransitioning 
      ? (fract(sin(dot(vUv, vec2(12.9898, 78.233) * 1200.0)) * 43758.5453))
      : 0.0;
    
    // Simplificar cálculos de facets
    float facets = noise * 1.8; // Reduzir multiplicador
    float dots = smoothstep(0.1, 0.15, noise);
    float n = step(0.2, facets) * dots;
    n = 1.0 - n;
    
    // Criar máscara para bordas (simplificado para melhor performance)
    float edgeMask = smoothstep(0.6, 1.0, normalizedDist);
    
    // Criar efeito de ruído nas bordas (simplificado quando não há transição)
    float edgeNoiseMultiplier = u_progress > 0.01 ? 0.7 : 0.5; // Reduzir quando inativo
    float edgeNoiseValue = (n + noise * edgeNoiseMultiplier) * edgeMask;
    float edgeEffect = edgeNoiseValue * 1.2;
    
    // Efeito de transição (quando u_progress > 0) - só calcular se necessário
    float transitionEffect = 0.0;
    if (isTransitioning) {
      float radius = 1.5;
      float outerProgress = clamp(1.1 * u_progress, 0., 1.);
      float innerProgress = clamp(1.1 * u_progress - 0.05, 0., 1.);
    
      float innerCircle = 1. - smoothstep((innerProgress - 0.4) * radius, innerProgress * radius, dist);
      float outerCircle = 1. - smoothstep((outerProgress - 0.1) * radius, innerProgress * radius, dist);
    
      float displacement = outerCircle - innerCircle;
      transitionEffect = displacement - (n + noise);
    }
    
    // Combinar: sempre mostrar bordas, adicionar transição quando ativa
    float finalEffect = edgeEffect + max(0.0, transitionEffect);
    
    float grainStrength = 0.2;
    vec3 final = vec3(finalEffect) - vec3(grain * grainStrength);
    
    // Opacidade: sempre mostrar nas bordas com alta visibilidade
    float edgeOpacity = edgeMask * 0.9; // Opacidade muito alta nas bordas para garantir visibilidade
    float transitionOpacity = smoothstep(0.0, 0.3, u_progress) * smoothstep(1.0, 0.7, u_progress) * 0.6;
    // Sempre garantir que as bordas tenham opacidade, mesmo sem transição
    // Quando progress é 0, usar apenas edgeOpacity; quando > 0, combinar ambos
    float progressFactor = step(0.01, u_progress); // 0 quando progress < 0.01, 1 quando >= 0.01
    float totalOpacity = edgeOpacity + (transitionOpacity * progressFactor);
    // Garantir que sempre haja opacidade nas bordas
    totalOpacity = max(edgeOpacity, totalOpacity);
    
    // Aplicar cor roxa com intensidade aumentada
    vec3 colorized = final * u_color * 2.0;
    
    gl_FragColor = vec4(colorized, clamp(totalOpacity, 0.0, 1.0));
  }
`;

interface NoiseTransitionBackgroundProps {
  onTransitionComplete?: () => void;
  triggerTransition?: boolean;
}

export function NoiseTransitionBackground({ 
  onTransitionComplete,
  triggerTransition = false 
}: NoiseTransitionBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const progressObjRef = useRef({ value: 0 });
  const isAnimatingRef = useRef(false);

  // Cor do botão "Ver Projetos" (gradiente: #8a2be2 → #9932cc)
  // Usando a cor mais vibrante do gradiente
  const purpleColor = new THREE.Color(0x9932cc); // #9932CC (accent-strong)

  useEffect(() => {
    if (!containerRef.current || rendererRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const aspect = width / height;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: false, // Desabilitar antialiasing para melhor performance
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
      stencil: false, // Desabilitar stencil buffer
      depth: false, // Desabilitar depth buffer (não necessário para 2D)
    });
    renderer.setSize(width, height);
    // Limitar pixel ratio drasticamente para melhor performance
    const pixelRatio = Math.min(window.devicePixelRatio, 1.0); // Reduzido para 1.0
    renderer.setPixelRatio(pixelRatio);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    // Otimizações de renderização
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_progress: { value: 0 },
        u_aspect: { value: aspect },
        u_color: { value: purpleColor },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    let lastFrameTime = 0;
    const targetFPS = 24; // Reduzido para 24 FPS para melhor performance
    const frameInterval = 1000 / targetFPS;
    let isVisible = true;
    let shouldRender = false; // Flag para controlar quando renderizar

    // Verificar visibilidade para pausar quando não visível
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0 });

    if (containerRef.current) {
      visibilityObserver.observe(containerRef.current);
    }

    const animate = (currentTime: number) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const hasActiveTransition = progressObjRef.current.value > 0.01;
      
      // Pausar completamente quando não visível E não há transição
      if (!isVisible && !hasActiveTransition) {
        shouldRender = false;
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Throttle para melhor performance
      const deltaTime = currentTime - lastFrameTime;
      if (deltaTime < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime = currentTime - (deltaTime % frameInterval);

      const time = clockRef.current.getElapsedTime();
      shouldRender = false; // Resetar flag
      if (materialRef.current) {
        // Só atualizar time se houver transição ativa
        if (hasActiveTransition) {
          materialRef.current.uniforms.u_time.value = time * 0.2;
          shouldRender = true;
        } else if (isVisible) {
          // Nas bordas (o shader decide), atualizar time muito lentamente
          materialRef.current.uniforms.u_time.value = time * 0.05; // Muito lento
          shouldRender = true; // O shader decide se renderiza ou não baseado na posição
        } else {
          shouldRender = false;
        }
        materialRef.current.uniforms.u_progress.value = progressObjRef.current.value;
      }

      // Só renderizar se necessário
      if (shouldRender) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Debounce resize para melhor performance
    let resizeTimeout: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!containerRef.current || !rendererRef.current || !materialRef.current) return;
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        const newAspect = newWidth / newHeight;
        rendererRef.current.setSize(newWidth, newHeight);
        materialRef.current.uniforms.u_aspect.value = newAspect;
      }, 150); // Debounce de 150ms
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      visibilityObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      materialRef.current?.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (triggerTransition && !isAnimatingRef.current && materialRef.current) {
      isAnimatingRef.current = true;
      
      // Usar requestAnimationFrame para atualizações mais suaves e performáticas
      let rafId: number | null = null;
      
      gsap.to(progressObjRef.current, {
        value: 1,
        duration: 1.8, // Reduzir duração para ser mais rápido
        ease: "power2.out",
        onUpdate: () => {
          if (materialRef.current && rafId === null) {
            rafId = requestAnimationFrame(() => {
              if (materialRef.current) {
                materialRef.current.uniforms.u_progress.value = progressObjRef.current.value;
              }
              rafId = null;
            });
          }
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          progressObjRef.current.value = 0;
          if (materialRef.current) {
            materialRef.current.uniforms.u_progress.value = 0;
          }
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
          }
          onTransitionComplete?.();
        },
      });
    }
  }, [triggerTransition, onTransitionComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        zIndex: 1, // Acima do background mas abaixo do conteúdo
        mixBlendMode: "screen", // Mistura com o background existente de forma aditiva
        opacity: 1, // Garantir que está visível
        willChange: "opacity", // Otimização do browser
        transform: "translateZ(0)", // Acelerar com GPU
      }}
    />
  );
}

