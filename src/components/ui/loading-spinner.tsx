"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface LoadingSpinnerProps {
  onComplete: () => void;
}

export function LoadingSpinner({ onComplete }: LoadingSpinnerProps) {
  const spinnerGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const duration = 2000; // 2 segundos para completar
    
    // Animação de rotação contínua da meia lua
    if (spinnerGroupRef.current) {
      gsap.to(spinnerGroupRef.current, {
        rotation: 360,
        duration: 1.2,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center"
      });
    }

    // Após a duração, fade out
    const timer = setTimeout(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
        }
      });

      tl.to(".loading-overlay", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }, duration);

    return () => {
      clearTimeout(timer);
      if (spinnerGroupRef.current) {
        gsap.killTweensOf(spinnerGroupRef.current);
      }
    };
  }, [onComplete]);

  const circumference = 2 * Math.PI * 50; // Circunferência total
  const halfCircumference = circumference / 2; // Meia lua

  return (
    <div className="loading-overlay fixed inset-0 z-[99999] flex items-center justify-center bg-[#0f1419]">
      <svg
        className="w-20 h-20"
        viewBox="0 0 120 120"
      >
        <g ref={spinnerGroupRef} transform="translate(60, 60)">
          {/* Meia lua - arco de 180 graus girando */}
          <circle
            cx="0"
            cy="0"
            r="50"
            fill="none"
            stroke="#8a2be2"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${halfCircumference} ${circumference}`}
            transform="rotate(-90)"
            style={{
              filter: "drop-shadow(0 0 8px rgba(138, 43, 226, 0.5))"
            }}
          />
        </g>
      </svg>
    </div>
  );
}
