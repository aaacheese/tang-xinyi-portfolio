"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GooeyNav, { type GooeyNavItem } from "./GooeyNav";

type PortfolioNavigationProps = {
  items: GooeyNavItem[];
};

const TOPBAR_HEIGHT = 68;
const ACTIVATION_LINE_RATIO = 0.22;

export default function PortfolioNavigation({
  items,
}: PortfolioNavigationProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const sectionIds = useMemo(
    () => items.map((item) => item.href.replace(/^#/, "")),
    [items],
  );

  const updateActiveSection = useCallback(() => {
    animationFrameRef.current = null;

    const viewportHeight = window.innerHeight;
    const activationLine =
      TOPBAR_HEIGHT +
      Math.max(0, viewportHeight - TOPBAR_HEIGHT) * ACTIVATION_LINE_RATIO;
    let nextIndex = 0;

    sectionIds.forEach((sectionId, index) => {
      const section = document.getElementById(sectionId);
      if (section && section.getBoundingClientRect().top <= activationLine) {
        nextIndex = index;
      }
    });

    const pageBottom = window.scrollY + viewportHeight;
    const documentBottom = document.documentElement.scrollHeight;
    if (documentBottom - pageBottom <= 2) {
      nextIndex = sectionIds.length - 1;
    }

    setActiveIndex((currentIndex) =>
      currentIndex === nextIndex ? currentIndex : nextIndex,
    );
  }, [sectionIds]);

  const requestActiveSectionUpdate = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(
      updateActiveSection,
    );
  }, [updateActiveSection]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(requestActiveSectionUpdate);
    resizeObserver.observe(document.documentElement);

    window.addEventListener("scroll", requestActiveSectionUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestActiveSectionUpdate);
    window.addEventListener("hashchange", requestActiveSectionUpdate);
    window.addEventListener("pageshow", requestActiveSectionUpdate);
    requestActiveSectionUpdate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestActiveSectionUpdate);
      window.removeEventListener("resize", requestActiveSectionUpdate);
      window.removeEventListener("hashchange", requestActiveSectionUpdate);
      window.removeEventListener("pageshow", requestActiveSectionUpdate);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [requestActiveSectionUpdate]);

  return (
    <>
      <input className="menu-toggle" id="menu-toggle" type="checkbox" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Back to top">
          TXY<span>.</span>
        </a>
        <GooeyNav
          activeIndex={activeIndex}
          className="desktop-nav"
          items={items}
          onActiveIndexChange={setActiveIndex}
          particleCount={10}
          particleR={200}
        />
        <label className="menu-button" htmlFor="menu-toggle">
          <span className="open-copy">Menu</span>
          <span className="close-copy">Close</span>
        </label>
      </header>

      <aside className="mobile-menu" aria-label="Mobile navigation">
        {items.map((item, index) => (
          <a
            className={activeIndex === index ? "active" : ""}
            href={item.href}
            key={item.href}
            aria-current={activeIndex === index ? "location" : undefined}
            onClick={() => setActiveIndex(index)}
          >
            {item.label}
          </a>
        ))}
      </aside>
    </>
  );
}
