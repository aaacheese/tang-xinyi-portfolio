"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";

type ExperienceItem = {
  company: string;
  role: string;
  date: string;
  color: string;
  current?: boolean;
};

type ExperienceStackProps = {
  items: ExperienceItem[];
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export default function ExperienceStack({
  items,
}: ExperienceStackProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const shellsRef = useRef<Array<HTMLDivElement | null>>([]);
  const cardsRef = useRef<Array<HTMLDetailsElement | null>>([]);
  const naturalTopsRef = useRef<number[]>([]);
  const animationFrameRef = useRef(0);

  const measure = useCallback(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const stackTop = window.scrollY + stack.getBoundingClientRect().top;
    let nextTop =
      stackTop + Number.parseFloat(window.getComputedStyle(stack).paddingTop);
    naturalTopsRef.current = shellsRef.current.map((shell) => {
      if (!shell) return 0;

      const naturalTop = nextTop;
      const marginBottom = Number.parseFloat(
        window.getComputedStyle(shell).marginBottom,
      );
      nextTop += shell.offsetHeight + marginBottom;
      return naturalTop;
    });
  }, []);

  const update = useCallback(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isDesktop = window.innerWidth > 760;

    if (!isDesktop || reduceMotion) {
      cardsRef.current.forEach((card) => {
        if (card) card.style.transform = "none";
      });
      return;
    }

    const scrollTop = window.scrollY;
    const stackPosition = window.innerHeight * 0.2;
    const scaleEndPosition = window.innerHeight * 0.1;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const cardTop = naturalTopsRef.current[index] ?? 0;
      const triggerStart = cardTop - stackPosition - 30 * index;
      const triggerEnd = cardTop - scaleEndPosition;
      const progress = clamp(
        (scrollTop - triggerStart) /
          Math.max(triggerEnd - triggerStart, 1),
      );
      const targetScale = 0.85 + index * 0.03;
      const scale = 1 - progress * (1 - targetScale);

      card.style.transform = `translateZ(0) scale(${scale.toFixed(4)})`;
    });
  }, []);

  const requestUpdate = useCallback(() => {
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = window.requestAnimationFrame(update);
  }, [update]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const refresh = () => {
      measure();
      requestUpdate();
    };
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(stack);
    cardsRef.current.forEach((card) => {
      if (card) resizeObserver.observe(card);
    });

    refresh();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", refresh);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", refresh);
    };
  }, [measure, requestUpdate]);

  return (
    <div className="experience-stack" ref={stackRef}>
      {items.map((item, index) => (
        <div
          className="experience-card-shell"
          key={item.company}
          ref={(shell) => {
            shellsRef.current[index] = shell;
          }}
          style={
            {
              "--stack-offset": `${index * 30}px`,
              zIndex: index + 1,
            } as CSSProperties
          }
        >
          <details
            className="experience-card"
            onToggle={() => window.requestAnimationFrame(measure)}
            ref={(card) => {
              cardsRef.current[index] = card;
            }}
            style={
              {
                "--experience-color": item.color,
              } as CSSProperties
            }
          >
            <summary>
              <i />
              <div className="exp-copy">
                <h3>
                  {item.company}
                  {item.current && <span>Current</span>}
                </h3>
                <p>{item.role}</p>
              </div>
              <div className="exp-date">
                <strong>{item.date}</strong>
                <span>expand</span>
              </div>
            </summary>
            <p className="exp-detail">
              Focused on interaction systems, user journeys and product
              experience across complex digital products.
            </p>
          </details>
        </div>
      ))}
      <div className="experience-stack-end" aria-hidden="true" />
    </div>
  );
}
