"use client";

import { useCallback, useEffect, useRef } from "react";

type ExperienceItem = {
  id: string;
  imageSrc: string;
  alt: string;
  width: number;
  height: number;
};

type ExperienceStackProps = {
  items: ExperienceItem[];
};

const STICKY_TOP = 80;
const MIN_SCALE = 0.83;
const MOBILE_BREAKPOINT = 760;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export default function ExperienceStack({
  items,
}: ExperienceStackProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);
  const animationFrameRef = useRef<number | null>(null);

  const updateCards = useCallback(() => {
    animationFrameRef.current = null;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const useStaticLayout =
      window.innerWidth <= MOBILE_BREAKPOINT || reducedMotion;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      if (useStaticLayout) {
        card.style.transform = "none";
        return;
      }

      const nextCard = cardsRef.current[index + 1];
      if (!nextCard) {
        card.style.transform = "scale(1)";
        return;
      }

      const nextTop = nextCard.getBoundingClientRect().top;
      const travelDistance = Math.max(
        window.innerHeight - STICKY_TOP,
        1,
      );
      const progress = clamp(
        (window.innerHeight - nextTop) / travelDistance,
      );
      const scale = 1 - progress * (1 - MIN_SCALE);

      card.style.transform = `scale(${scale.toFixed(4)})`;
    });
  }, []);

  const requestUpdate = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(updateCards);
  }, [updateCards]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const resizeObserver = new ResizeObserver(requestUpdate);

    resizeObserver.observe(stack);
    cardsRef.current.forEach((card) => {
      if (card) resizeObserver.observe(card);
    });

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);
    requestUpdate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotion.removeEventListener("change", requestUpdate);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [requestUpdate]);

  return (
    <div
      className="project-stack"
      ref={stackRef}
      aria-label="Experience projects"
    >
      {items.map((item, index) => (
        <figure
          className="project-stack-card"
          key={item.id}
          ref={(card) => {
            cardsRef.current[index] = card;
          }}
          style={{ zIndex: index + 1 }}
        >
          <img
            src={item.imageSrc}
            alt={item.alt}
            width={item.width}
            height={item.height}
          />
        </figure>
      ))}
      <div className="project-stack-end" aria-hidden="true" />
    </div>
  );
}
