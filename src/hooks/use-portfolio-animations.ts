"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function usePortfolioAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const SHOW_MARKERS = false;

      gsap.from("[data-hero] .hero-line", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.12,
      });

      gsap.from("[data-service-card]", {
        opacity: 0,
        y: 60,
        stagger: 0.1,
        scrollTrigger: {
          trigger: "#servicos",
          start: "top 75%",
          markers: SHOW_MARKERS,
        },
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
        xPercent: -10,
        stagger: 0.15,
        scrollTrigger: {
          trigger: "#processo",
          start: "top 80%",
          markers: SHOW_MARKERS,
        },
      });

      gsap.from("[data-tech-chip]", {
        opacity: 0,
        y: 40,
        stagger: 0.08,
        scrollTrigger: {
          trigger: "#tecnologias",
          start: "top 85%",
          markers: SHOW_MARKERS,
        },
      });
    });

    return () => ctx.revert();
  }, []);
}










