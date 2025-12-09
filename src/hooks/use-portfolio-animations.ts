"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function usePortfolioAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const SHOW_MARKERS = false;
      // Timeline principal da hero - controla TUDO com scrub (igual ao notebook)
      // NOTA: Os textos começam visíveis (animados pela HeroSection no carregamento)
      // Esta timeline apenas controla a saída quando o usuário scrolla
      const tlHero = gsap.timeline({
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top", 
          scrub: 1,  // Anima suavemente conforme o scroll
          pin: true,
          pinSpacing: false,
          markers: SHOW_MARKERS,
        }
      });

      // Animações de PROFUNDIDADE para os textos - EXATAMENTE como o notebook
      // Os textos começam visíveis e vão sumindo conforme scroll
      // Efeito: scale diminui, move para baixo e para trás, blur aumenta, opacity diminui
      
      tlHero.to("[data-hero-content]", {
        y: 100,        // Move para baixo (mesmo sentido do notebook)
        opacity: 0,    // Fade out
        scale: 0.6,    // Zoom out (MESMO scale do notebook)
        filter: "blur(10px)",  // Blur aumenta
        duration: 1,
        ease: "power2.inOut"
      }, 0);

      tlHero.to(".hero-line", {
        y: 100,        // Move para baixo (mesmo sentido do notebook)
        x: -50,        // Move para trás/esquerda (mesmo sentido do notebook)
        opacity: 0,    // Fade out
        scale: 0.6,    // Zoom out (MESMO scale do notebook)
        filter: "blur(8px)",   // Blur aumenta
        duration: 1,
        ease: "power2.inOut"
      }, 0);

      tlHero.to(".hero-stats-item", {
        y: 100,        // Move para baixo (mesmo sentido do notebook)
        x: -50,        // Move para trás/esquerda (mesmo sentido do notebook)
        opacity: 0,    // Fade out
        scale: 0.6,    // Zoom out (MESMO scale do notebook)
        filter: "blur(5px)",   // Blur aumenta (mesmo do notebook)
        duration: 1,
        ease: "power2.inOut"
      }, 0);

      tlHero.to(".hero-planet-container", {
        scale: 0.6,
        y: 100,
        x: -50,
        opacity: 0,
        filter: "blur(5px)",
        duration: 1,
        ease: "power2.inOut"
      }, 0);

      tlHero.to("[data-hero-background]", {
        opacity: 0,
        scale: 1.1,
        filter: "blur(20px)",
        duration: 1,
        ease: "power2.inOut"
      }, 0);


      gsap.set("#servicos", { zIndex: 10, position: "relative" });
      
      gsap.from("#servicos > div:first-child", {
        scrollTrigger: {
          trigger: "#servicos",
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
          markers: SHOW_MARKERS,
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      gsap.utils.toArray<HTMLElement>("[data-service-card]").forEach((card, i) => {
        gsap.fromTo(card, 
          { 
            opacity: 0, 
            y: 100,
            rotationX: 45,
            transformPerspective: 1000,
            scale: 0.8
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "top 60%",
              scrub: false,
              toggleActions: "play none none reverse"
            },
            delay: i * 0.1
          }
        );
      });


      gsap.utils.toArray<HTMLElement>("[data-project-card]").forEach((card) => {
        const media = card.querySelector("img");
        if (!media) return;
        gsap.to(media, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            scrub: true,
            markers: SHOW_MARKERS,
          },
        });
      });

      ScrollTrigger.create({
        trigger: "#projetos",
        start: "top top",
        end: "bottom+=40% top",
        pin: "#projects-pin",
        pinSpacing: false,
        markers: SHOW_MARKERS,
      });

      gsap.from("[data-process-step]", {
        opacity: 0,
        x: -50,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: {
          trigger: "#processo",
          start: "top 75%",
          toggleActions: "play none none reverse"
        },
      });

      gsap.from("[data-tech-chip]", {
        opacity: 0,
        scale: 0.8,
        y: 30,
        stagger: {
          amount: 0.8,
          grid: "auto",
          from: "center"
        },
        duration: 0.8,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: "#tecnologias",
          start: "top 85%",
        },
      });
    });

    return () => ctx.revert();
  }, []);
}
