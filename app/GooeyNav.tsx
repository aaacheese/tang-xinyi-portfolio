"use client";

import { useEffect, useRef } from "react";

export type GooeyNavItem = {
  label: string;
  href: string;
};

type GooeyNavProps = {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  activeIndex: number;
  onActiveIndexChange?: (index: number) => void;
  className?: string;
};

const noise = (value = 1) => value / 2 - Math.random() * value;

const getXY = (
  distance: number,
  pointIndex: number,
  totalPoints: number,
): [number, number] => {
  const angle =
    (((360 + noise(8)) / totalPoints) * pointIndex * Math.PI) / 180;
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
};

export default function GooeyNav({
  items,
  animationTime = 600,
  particleCount = 10,
  particleDistances = [90, 10],
  particleR = 200,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  activeIndex,
  onActiveIndexChange,
  className = "",
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const timersRef = useRef<number[]>([]);

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const styles = {
      left: `${itemRect.x - containerRect.x}px`,
      top: `${itemRect.y - containerRect.y}px`,
      width: `${itemRect.width}px`,
      height: `${itemRect.height}px`,
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.textContent = element.textContent;
  };

  const clearParticles = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    filterRef.current
      ?.querySelectorAll(".gooey-particle")
      .forEach((particle) => particle.remove());
  };

  const makeParticles = (element: HTMLElement) => {
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);

    for (let index = 0; index < particleCount; index += 1) {
      const time = animationTime * 2 + noise(timeVariance * 2);
      const rotateNoise = noise(particleR / 10);
      const start = getXY(
        particleDistances[0],
        particleCount - index,
        particleCount,
      );
      const end = getXY(
        particleDistances[1] + noise(7),
        particleCount - index,
        particleCount,
      );
      const rotate =
        rotateNoise > 0
          ? (rotateNoise + particleR / 20) * 10
          : (rotateNoise - particleR / 20) * 10;

      element.classList.remove("active");

      const createTimer = window.setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");
        particle.className = "gooey-particle";
        point.className = "gooey-point";
        particle.style.setProperty("--start-x", `${start[0]}px`);
        particle.style.setProperty("--start-y", `${start[1]}px`);
        particle.style.setProperty("--end-x", `${end[0]}px`);
        particle.style.setProperty("--end-y", `${end[1]}px`);
        particle.style.setProperty("--time", `${time}ms`);
        particle.style.setProperty("--scale", `${1 + noise(0.2)}`);
        particle.style.setProperty(
          "--color",
          `var(--gooey-color-${colors[Math.floor(Math.random() * colors.length)]}, white)`,
        );
        particle.style.setProperty("--rotate", `${rotate}deg`);
        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => element.classList.add("active"));

        const removeTimer = window.setTimeout(() => particle.remove(), time);
        timersRef.current.push(removeTimer);
      }, 30);

      timersRef.current.push(createTimer);
    }
  };

  const activateItem = (element: HTMLElement, index: number) => {
    if (activeIndex === index) return;

    onActiveIndexChange?.(index);
    updateEffectPosition(element);
    clearParticles();

    if (textRef.current) {
      textRef.current.classList.remove("active");
      void textRef.current.offsetWidth;
      textRef.current.classList.add("active");
    }

    if (
      filterRef.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      makeParticles(filterRef.current);
    }
  };

  useEffect(() => {
    const list = navRef.current;
    const container = containerRef.current;
    if (!list || !container) return;

    const activeItem = list.querySelectorAll("li")[activeIndex] as
      | HTMLElement
      | undefined;
    if (activeItem) {
      updateEffectPosition(activeItem);
      textRef.current?.classList.add("active");
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentItem = list.querySelectorAll("li")[activeIndex] as
        | HTMLElement
        | undefined;
      if (currentItem) updateEffectPosition(currentItem);
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  return (
    <div
      className={`gooey-nav-container ${className}`.trim()}
      ref={containerRef}
    >
      <nav aria-label="Primary navigation">
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li
              className={activeIndex === index ? "active" : ""}
              key={item.href}
            >
              <a
                href={item.href}
                aria-current={activeIndex === index ? "location" : undefined}
                onClick={(event) =>
                  activateItem(event.currentTarget.parentElement, index)
                }
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="gooey-effect gooey-filter" ref={filterRef} />
      <span className="gooey-effect gooey-text" ref={textRef} />
    </div>
  );
}
