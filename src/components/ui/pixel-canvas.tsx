"use client";

import { useEffect, useRef, useState } from "react";

interface Pixel {
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;
  blinkTimer: number;
  blinkInterval: number;
  blinkPhase: number;
  opacity: number;
  baseOpacity: number;
}

interface PixelCanvasProps {
  gap?: number;
  speed?: number;
  colors?: string[];
  className?: string;
  isHovered?: boolean;
}

export function PixelCanvas({ 
  gap = 5, 
  speed = 35, 
  colors = ["#8A2BE2", "#9932CC", "#9370DB", "#BA55D3", "#DA70D6"],
  className = "",
  isHovered: externalIsHovered
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const [internalIsHovered, setInternalIsHovered] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const timePreviousRef = useRef(performance.now());
  const timeInterval = 1000 / 60;
  
  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalIsHovered;

  const getRandomValue = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const getDistanceToCanvasCenter = (x: number, y: number, width: number, height: number) => {
    const dx = x - width / 2;
    const dy = y - height / 2;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const init = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speedValue = reducedMotion ? 0 : (speed * 0.001);
    const gapValue = Math.max(4, Math.min(50, gap));

    pixelsRef.current = [];

    for (let x = 0; x < width; x += gapValue) {
      for (let y = 0; y < height; y += gapValue) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = reducedMotion ? 0 : getDistanceToCanvasCenter(x, y, width, height);

        const pixel: Pixel = {
          x,
          y,
          color,
          speed: getRandomValue(0.1, 0.9) * speedValue,
          size: getRandomValue(0.3, 0.8) * getRandomValue(0.5, 2) * 0.3, // Tamanho inicial aleatório pequeno
          sizeStep: Math.random() * 0.4,
          minSize: 0.5,
          maxSize: getRandomValue(0.5, 2),
          delay,
          counter: 0,
          counterStep: Math.random() * 4 + (width + height) * 0.01,
          isIdle: false, // Sempre ativo para piscar
          isReverse: false,
          isShimmer: false,
          blinkTimer: getRandomValue(0, 2000), // Timer inicial aleatório
          blinkInterval: getRandomValue(500, 2000), // Intervalo aleatório entre 0.5-2 segundos (mais rápido e perceptível)
          blinkPhase: Math.random() * Math.PI * 2, // Fase aleatória para cada pixel
          opacity: 0.6,
          baseOpacity: getRandomValue(0.3, 0.7), // Opacidade base aleatória
        };

        pixelsRef.current.push(pixel);
      }
    }
    
    setIsInitialized(true);
  };

  const drawPixel = (pixel: Pixel, ctx: CanvasRenderingContext2D, deltaTime: number) => {
    const centerOffset = 2 * 0.5 - pixel.size * 0.5;
    
    // Efeito de piscar aleatório
    pixel.blinkTimer += deltaTime;
    if (pixel.blinkTimer >= pixel.blinkInterval) {
      pixel.blinkTimer = 0;
      pixel.blinkInterval = getRandomValue(500, 2000); // Novo intervalo aleatório (mais rápido)
    }
    
    // Calcular opacidade com base no ciclo de piscar
    const blinkProgress = (pixel.blinkTimer / pixel.blinkInterval) * Math.PI * 2 + pixel.blinkPhase;
    const blinkFactor = (Math.sin(blinkProgress) + 1) / 2; // 0 a 1
    pixel.opacity = pixel.baseOpacity * (0.3 + blinkFactor * 0.7); // Varia entre 30% e 100% da opacidade base
    
    // Extrair valores RGB da cor e aplicar opacidade
    const rgbaMatch = pixel.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pixel.opacity})`;
    } else {
      ctx.fillStyle = pixel.color;
    }
    
    ctx.fillRect(
      pixel.x + centerOffset,
      pixel.y + centerOffset,
      pixel.size,
      pixel.size
    );
  };

  const appear = (pixel: Pixel) => {
    pixel.isIdle = false;

    if (pixel.counter <= pixel.delay) {
      pixel.counter += pixel.counterStep;
      return;
    }

    if (pixel.size >= pixel.maxSize) {
      pixel.isShimmer = true;
    }

    if (pixel.isShimmer) {
      shimmer(pixel);
    } else {
      pixel.size += pixel.sizeStep;
    }
  };

  const disappear = (pixel: Pixel) => {
    pixel.isShimmer = false;
    pixel.counter = 0;

    if (pixel.size <= 0) {
      pixel.isIdle = true;
      return;
    } else {
      pixel.size -= 0.1;
    }
  };

  const shimmer = (pixel: Pixel) => {
    if (pixel.size >= pixel.maxSize) {
      pixel.isReverse = true;
    } else if (pixel.size <= pixel.minSize) {
      pixel.isReverse = false;
    }

    if (pixel.isReverse) {
      pixel.size -= pixel.speed;
    } else {
      pixel.size += pixel.speed;
    }
  };

  const animate = (fnName: "appear" | "disappear" | "idle") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const timeNow = performance.now();
    const timePassed = timeNow - timePreviousRef.current;

    if (timePassed < timeInterval) {
      animationRef.current = requestAnimationFrame(() => animate(fnName));
      return;
    }

    const deltaTime = timePassed;
    timePreviousRef.current = timeNow - (timePassed % timeInterval);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < pixelsRef.current.length; i++) {
      const pixel = pixelsRef.current[i];
      if (fnName === "appear") {
        appear(pixel);
      } else if (fnName === "disappear") {
        disappear(pixel);
      } else if (fnName === "idle") {
        // Em modo idle, apenas atualiza o piscar sem mudar o tamanho
        if (pixel.size === 0) {
          pixel.size = pixel.maxSize * 0.3; // Mantém um tamanho mínimo visível
          pixel.isIdle = false;
        }
      }
      if (pixel.size > 0) {
        drawPixel(pixel, ctx, deltaTime);
      }
    }

    // Para animação idle, sempre continua
    if (fnName === "idle") {
      animationRef.current = requestAnimationFrame(() => animate(fnName));
      return;
    }

    if (pixelsRef.current.every((pixel) => pixel.isIdle)) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    animationRef.current = requestAnimationFrame(() => animate(fnName));
  };

  const handleAnimation = (name: "appear" | "disappear" | "idle") => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animate(name);
  };

  // Iniciar animação idle contínua após inicialização
  useEffect(() => {
    if (isInitialized && pixelsRef.current.length > 0 && !isHovered) {
      handleAnimation("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  useEffect(() => {
    // Aguardar um frame para garantir que o container esteja renderizado
    const timeoutId = setTimeout(() => {
      init();
    }, 0);

    const resizeObserver = new ResizeObserver(() => {
      init();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gap, speed]);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (isHovered) {
      handleAnimation("appear");
    } else {
      // Quando sair do hover, voltar para modo idle após desaparecer
      handleAnimation("disappear");
      // Após um delay, voltar para idle
      const timeoutId = setTimeout(() => {
        if (!isHovered && pixelsRef.current.length > 0) {
          pixelsRef.current.forEach((pixel) => {
            if (pixel.size === 0) {
              pixel.size = pixel.maxSize * 0.3;
              pixel.isIdle = false;
            }
          });
          handleAnimation("idle");
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, isInitialized]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      onMouseEnter={() => setInternalIsHovered(true)}
      onMouseLeave={() => setInternalIsHovered(false)}
      style={{ pointerEvents: "none" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ mixBlendMode: "normal", opacity: 0.8 }}
      />
      {/* Overlay escuro no hover para melhorar contraste do texto */}
      <div
        className={`absolute inset-0 z-[1] bg-gradient-to-br from-primary/40 via-primary/30 to-primary/50 transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}

