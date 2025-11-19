"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function AnimatedBackgroundGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const groupRef = useRef<SVGGElement>(null);
  const GRID_SIZE = 60; 
  const GRID_COLOR = "rgba(255, 255, 255, 0.045)"; 
  const HIGHLIGHT_COLOR = "#a855f7"; 

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!groupRef.current || dimensions.width === 0) return;

    const cols = Math.ceil(dimensions.width / GRID_SIZE);
    const rows = Math.ceil(dimensions.height / GRID_SIZE);
    
    const ctx = gsap.context(() => {
      const spawnSquare = () => {
        const randomCol = Math.floor(Math.random() * cols);
        const randomRow = Math.floor(Math.random() * rows);
        
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", String(randomCol * GRID_SIZE));
        rect.setAttribute("y", String(randomRow * GRID_SIZE));
        rect.setAttribute("width", String(GRID_SIZE - 0.5)); 
        rect.setAttribute("height", String(GRID_SIZE - 0.5));
        rect.setAttribute("fill", HIGHLIGHT_COLOR);
        rect.setAttribute("opacity", "0");
        
        groupRef.current?.appendChild(rect);
        
        const tl = gsap.timeline({
            onComplete: () => {
                if (rect.parentNode) rect.parentNode.removeChild(rect);
            }
        });

        tl.to(rect, {
            opacity: Math.random() * 0.05 + 0.02, 
            duration: 0.8 + Math.random() * 0.6, 
            ease: "power2.out"
        })
        .to(rect, {
            opacity: 0,
            duration: 1.2 + Math.random() * 0.8, 
            ease: "power2.in",
            delay: Math.random() * 0.4
        });
      };

      const interval = setInterval(() => {
          const shouldSpawn = Math.random() > 0.6; 
          if (shouldSpawn) spawnSquare();
      }, 400); 

      return () => clearInterval(interval);
    }, groupRef);

    return () => ctx.revert();
  }, [dimensions]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <svg 
            width="100%" 
            height="100%" 
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-[0.8]" 
        >
            <defs>
                <pattern id="grid-pattern" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                    <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke={GRID_COLOR} strokeWidth="1" />
                </pattern>
                <mask id="fade-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <circle cx="50%" cy="50%" r="60%" fill="black" fillOpacity="0.2" />
                    <circle cx="0%" cy="0%" r="40%" fill="black" fillOpacity="0.8" />
                    <circle cx="100%" cy="100%" r="40%" fill="black" fillOpacity="0.8" />
                    <circle cx="100%" cy="0%" r="30%" fill="black" fillOpacity="0.6" />
                    <circle cx="0%" cy="100%" r="30%" fill="black" fillOpacity="0.6" />
                </mask>
            </defs>
            
            <g mask="url(#fade-mask)">
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                <g ref={groupRef} />
            </g>
        </svg>
        
        <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,#0f1419_100%)]" style={{ background: 'radial-gradient(circle at center, transparent 30%,rgb(16, 15, 25) 100%)' }} />
    </div>
  );
}

