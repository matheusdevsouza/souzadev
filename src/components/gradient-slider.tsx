"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/content";
import gsap from "gsap";

// Physics constants
const FRICTION = 0.9;
const WHEEL_SENS = 0.6;
const DRAG_SENS = 1.0;

// Visual constants
const MAX_ROTATION = 28;
const MAX_DEPTH = 140;
const MIN_SCALE = 0.92;
const SCALE_RANGE = 0.1;
const GAP = 28;

interface GradientSliderProps {
  onComplete?: () => void;
}

export function GradientSlider({ onComplete }: GradientSliderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRootRef = useRef<HTMLDivElement>(null);
  
  const itemsRef = useRef<Array<{ el: HTMLDivElement; x: number }>>([]);
  const positionsRef = useRef<Float32Array>(new Float32Array(0));
  const activeIndexRef = useRef(-1);
  const isEnteringRef = useRef(true);
  
  const CARD_W = useRef(300);
  const CARD_H = useRef(400);
  const STEP = useRef(CARD_W.current + GAP);
  const TRACK = useRef(projects.length * STEP.current);
  const SCROLL_X = useRef(0);
  const VW_HALF = useRef(typeof window !== 'undefined' ? window.innerWidth * 0.5 : 0);
  
  const vX = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastTime = useRef(0);
  
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const lastDelta = useRef(0);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const projectsViewed = useRef(new Set<number>());
  const allProjectsViewedRef = useRef(false);

  // Utility functions
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const computeTransformComponents = (screenX: number) => {
    const norm = Math.max(-1, Math.min(1, screenX / VW_HALF.current));
    const absNorm = Math.abs(norm);
    const invNorm = 1 - absNorm;
    const ry = -norm * MAX_ROTATION;
    const tz = invNorm * MAX_DEPTH;
    const scale = MIN_SCALE + invNorm * SCALE_RANGE;
    return { norm, absNorm, invNorm, ry, tz, scale };
  };

  const transformForScreenX = (screenX: number) => {
    const { ry, tz, scale } = computeTransformComponents(screenX);
    return {
      transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
      z: tz,
    };
  };

  const updateCarouselTransforms = () => {
    const half = TRACK.current / 2;
    let closestIdx = -1;
    let closestDist = Infinity;

    for (let i = 0; i < itemsRef.current.length; i++) {
      let pos = itemsRef.current[i].x - SCROLL_X.current;
      if (pos < -half) pos += TRACK.current;
      if (pos > half) pos -= TRACK.current;
      
      positionsRef.current[i] = pos;

      const dist = Math.abs(pos);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    const prevIdx = (closestIdx - 1 + itemsRef.current.length) % itemsRef.current.length;
    const nextIdx = (closestIdx + 1) % itemsRef.current.length;

    for (let i = 0; i < itemsRef.current.length; i++) {
      const it = itemsRef.current[i];
      const pos = positionsRef.current[i];
      const norm = Math.max(-1, Math.min(1, pos / VW_HALF.current));
      const { transform, z } = transformForScreenX(pos);

      it.el.style.transform = transform;
      it.el.style.zIndex = String(1000 + Math.round(z));

      const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
      const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1);
      it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
    }

    // Track viewed projects
    if (closestIdx >= 0 && !allProjectsViewedRef.current) {
      projectsViewed.current.add(closestIdx);
      
      // Check if all projects have been viewed
      if (projectsViewed.current.size >= projects.length) {
        allProjectsViewedRef.current = true;
        // Wait a bit then trigger completion
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    }

    // Update active index
    activeIndexRef.current = closestIdx;
  };

  const tick = (t: number) => {
    const dt = lastTime.current ? (t - lastTime.current) / 1000 : 0;
    lastTime.current = t;

    SCROLL_X.current = mod(SCROLL_X.current + vX.current * dt, TRACK.current);

    const decay = Math.pow(FRICTION, dt * 60);
    vX.current *= decay;
    if (Math.abs(vX.current) < 0.02) vX.current = 0;

    updateCarouselTransforms();
    rafId.current = requestAnimationFrame(tick);
  };

  const startCarousel = () => {
    cancelCarousel();
    lastTime.current = 0;
    rafId.current = requestAnimationFrame((t) => {
      updateCarouselTransforms();
      tick(t);
    });
  };

  const cancelCarousel = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  };


  const measure = () => {
    const sample = itemsRef.current[0]?.el;
    if (!sample) return;

    const r = sample.getBoundingClientRect();
    CARD_W.current = r.width || CARD_W.current;
    CARD_H.current = r.height || CARD_H.current;
    STEP.current = CARD_W.current + GAP;
    TRACK.current = itemsRef.current.length * STEP.current;

    itemsRef.current.forEach((it, i) => {
      it.x = i * STEP.current;
    });

    positionsRef.current = new Float32Array(itemsRef.current.length);
  };

  const onResize = () => {
    const prevStep = STEP.current || 1;
    const ratio = SCROLL_X.current / (itemsRef.current.length * prevStep);
    measure();
    VW_HALF.current = window.innerWidth * 0.5;
    SCROLL_X.current = mod(ratio * TRACK.current, TRACK.current);
    updateCarouselTransforms();
  };

  useEffect(() => {
    if (!stageRef.current || !cardsRootRef.current) return;

    // Create cards
    const fragment = document.createDocumentFragment();
    itemsRef.current = [];

    projects.forEach((project, i) => {
      const card = document.createElement('div');
      card.className = 'absolute top-1/2 left-1/2 w-[min(28vw,380px)] aspect-[4/5]';
      card.style.willChange = 'transform';
      card.style.transformStyle = 'preserve-3d';
      card.style.backfaceVisibility = 'hidden';
      card.style.isolation = 'isolate';

      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'relative w-full h-full rounded-[15px] overflow-hidden';
      
      const img = document.createElement('img');
      img.src = project.image;
      img.alt = project.title;
      img.className = 'w-full h-full object-cover';
      img.draggable = false;
      img.loading = 'eager';
      img.decoding = 'async';

      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-6 flex flex-col justify-end';
      
      const title = document.createElement('h3');
      title.className = 'text-white text-xl font-semibold mb-1';
      title.textContent = project.title;
      
      const result = document.createElement('p');
      result.className = 'text-lavender/90 text-sm';
      result.textContent = project.result;

      overlay.appendChild(title);
      overlay.appendChild(result);
      imgWrapper.appendChild(img);
      imgWrapper.appendChild(overlay);
      card.appendChild(imgWrapper);
      fragment.appendChild(card);
      itemsRef.current.push({ el: card as HTMLDivElement, x: i * STEP.current });
    });

    cardsRootRef.current.appendChild(fragment);

    // Wait for images to load
    Promise.all(
      itemsRef.current.map((it) => {
        const img = it.el.querySelector('img');
        if (!img || img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        });
      })
    ).then(() => {
      measure();
      updateCarouselTransforms();
      
      const half = TRACK.current / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < itemsRef.current.length; i++) {
        let pos = itemsRef.current[i].x - SCROLL_X.current;
        if (pos < -half) pos += TRACK.current;
        if (pos > half) pos -= TRACK.current;
        const d = Math.abs(pos);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      }
      activeIndexRef.current = closestIdx;

      startCarousel();
      setIsInitialized(true);
      isEnteringRef.current = false;
    });

    // Event handlers
    const handleWheel = (e: WheelEvent) => {
      if (isEnteringRef.current) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      vX.current += delta * WHEEL_SENS * 20;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isEnteringRef.current) return;
      dragging.current = true;
      lastX.current = e.clientX;
      lastT.current = performance.now();
      lastDelta.current = 0;
      if (stageRef.current) {
        stageRef.current.setPointerCapture(e.pointerId);
        stageRef.current.classList.add('dragging');
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const now = performance.now();
      const dx = e.clientX - lastX.current;
      const dt = Math.max(1, now - lastT.current) / 1000;
      SCROLL_X.current = mod(SCROLL_X.current - dx * DRAG_SENS, TRACK.current);
      lastDelta.current = dx / dt;
      lastX.current = e.clientX;
      lastT.current = now;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      if (stageRef.current) {
        stageRef.current.releasePointerCapture(e.pointerId);
        stageRef.current.classList.remove('dragging');
      }
      vX.current = -lastDelta.current * DRAG_SENS;
    };

    const handleResize = () => {
      clearTimeout((handleResize as any)._t);
      (handleResize as any)._t = setTimeout(onResize, 80);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelCarousel();
      } else {
        startCarousel();
      }
    };

    if (stageRef.current) {
      stageRef.current.addEventListener('wheel', handleWheel, { passive: false });
      stageRef.current.addEventListener('pointerdown', handlePointerDown);
      stageRef.current.addEventListener('pointermove', handlePointerMove);
      stageRef.current.addEventListener('pointerup', handlePointerUp);
      stageRef.current.addEventListener('dragstart', (e) => e.preventDefault());
    }
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelCarousel();
      if (stageRef.current) {
        stageRef.current.removeEventListener('wheel', handleWheel);
        stageRef.current.removeEventListener('pointerdown', handlePointerDown);
        stageRef.current.removeEventListener('pointermove', handlePointerMove);
        stageRef.current.removeEventListener('pointerup', handlePointerUp);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <section id="projetos" className="space-y-12">
      {/* Título e descrição acima do slider */}
      <div className="px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-7xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-lavender/70">Projetos</p>
          <h2 className="font-display text-4xl text-white">Projetos que transformam.</h2>
          <p className="text-lg text-lavender/90 max-w-2xl">
            Cases reais que transformaram negócios. Cada projeto é uma jornada única de estratégia, design e tecnologia, entregando resultados mensuráveis e impactos duradouros.
          </p>
        </div>
      </div>
      
      <div 
        className="relative w-screen" 
        style={{ 
          height: '60vh', 
          minHeight: '450px',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
      >
        <div
          ref={stageRef}
          className="stage relative h-full w-full touch-none cursor-grab select-none"
          style={{ 
            perspective: '1800px',
            overflow: 'hidden'
          }}
        >
          <div
            ref={cardsRootRef}
            className="cards absolute inset-0 z-10"
            style={{ 
              transformStyle: 'preserve-3d',
              maskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 20%, black 80%, transparent 95%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 20%, black 80%, transparent 95%, transparent 100%)'
            }}
          />
        </div>
      </div>
    </section>
  );
}

