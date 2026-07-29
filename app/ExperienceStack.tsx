"use client";

import Lenis from "lenis";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
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

type CardTransform = {
  translateY: number;
  scale: number;
  rotation: number;
  blur: number;
};

const ITEM_DISTANCE = 100;
const ITEM_SCALE = 0.03;
const ITEM_STACK_DISTANCE = 30;
const STACK_POSITION = "20%";
const BASE_SCALE = 0.85;
const ROTATION_AMOUNT = 0;
const BLUR_AMOUNT = 0;
const MOBILE_BREAKPOINT = 760;
const UNFOLD_DISTANCE = 160;

const calculateProgress = (scrollTop: number, start: number, end: number) => {
  if (scrollTop < start) return 0;
  if (scrollTop > end) return 1;
  return (scrollTop - start) / Math.max(end - start, 1);
};

const parsePercentage = (value: string | number, containerHeight: number) => {
  if (typeof value === "string" && value.includes("%")) {
    return (Number.parseFloat(value) / 100) * containerHeight;
  }
  return Number.parseFloat(String(value));
};

export default function ExperienceStack({
  items,
}: ExperienceStackProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const lastTransformsRef = useRef<Map<number, CardTransform>>(new Map());
  const isUpdatingRef = useRef(false);
  const [stackEnabled, setStackEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updateMode = () => {
      setStackEnabled(
        window.innerWidth > MOBILE_BREAKPOINT && !reducedMotion.matches,
      );
    };

    updateMode();
    reducedMotion.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode);

    return () => {
      reducedMotion.removeEventListener("change", updateMode);
      window.removeEventListener("resize", updateMode);
    };
  }, []);

  const updateCardTransforms = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !cardsRef.current.length || isUpdatingRef.current) {
      return;
    }

    isUpdatingRef.current = true;

    const scrollTop = scroller.scrollTop;
    const containerHeight = scroller.clientHeight;
    const stackPositionPx = parsePercentage(
      STACK_POSITION,
      containerHeight,
    );

    cardsRef.current.forEach((card, index) => {
      const cardTop = card.offsetTop;
      const unfoldStart = index * UNFOLD_DISTANCE;
      const unfoldEnd = unfoldStart + UNFOLD_DISTANCE;
      const unfoldProgress = calculateProgress(
        scrollTop,
        unfoldStart,
        unfoldEnd,
      );
      const targetScale = BASE_SCALE + index * ITEM_SCALE;
      const scale =
        targetScale + unfoldProgress * (1 - targetScale);
      const rotation = ROTATION_AMOUNT
        ? index * ROTATION_AMOUNT * (1 - unfoldProgress)
        : 0;

      let blur = 0;
      if (BLUR_AMOUNT) {
        blur = Math.max(
          0,
          (cardsRef.current.length - index - 1) *
            BLUR_AMOUNT *
            (1 - unfoldProgress),
        );
      }

      const stackedTop =
        stackPositionPx + ITEM_STACK_DISTANCE * index;
      const naturalTop = cardTop - scrollTop;
      const visibleTop =
        stackedTop + (naturalTop - stackedTop) * unfoldProgress;
      const translateY = visibleTop - naturalTop;

      const nextTransform: CardTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };
      const previousTransform = lastTransformsRef.current.get(index);
      const hasChanged =
        !previousTransform ||
        Math.abs(previousTransform.translateY - nextTransform.translateY) >
          0.1 ||
        Math.abs(previousTransform.scale - nextTransform.scale) > 0.001 ||
        Math.abs(previousTransform.rotation - nextTransform.rotation) > 0.1 ||
        Math.abs(previousTransform.blur - nextTransform.blur) > 0.1;

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${nextTransform.translateY}px, 0) scale(${nextTransform.scale}) rotate(${nextTransform.rotation}deg)`;
        card.style.filter =
          nextTransform.blur > 0 ? `blur(${nextTransform.blur}px)` : "";
        lastTransformsRef.current.set(index, nextTransform);
      }
    });

    isUpdatingRef.current = false;
  }, []);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      scroller.querySelectorAll<HTMLDivElement>(".scroll-stack-card"),
    );
    cardsRef.current = cards;

    if (!stackEnabled) {
      cards.forEach((card) => {
        card.style.marginBottom = "";
        card.style.transform = "none";
        card.style.filter = "";
        card.style.willChange = "auto";
      });
      lastTransformsRef.current.clear();
      return;
    }

    cards.forEach((card, index) => {
      if (index < cards.length - 1) {
        card.style.marginBottom = `${ITEM_DISTANCE}px`;
      }
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
      card.style.webkitTransform = "translateZ(0)";
      card.style.perspective = "1000px";
      card.style.webkitPerspective = "1000px";
    });

    const handleScroll = () => updateCardTransforms();
    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.querySelector<HTMLElement>(".scroll-stack-inner")!,
      duration: 1.2,
      easing: (time) =>
        Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      gestureOrientation: "vertical",
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
      touchInertiaExponent: 1.7,
      overscroll: true,
    });

    const handleBoundaryWheel = (event: WheelEvent) => {
      const atTop =
        lenis.targetScroll <= 1 && lenis.animatedScroll <= 1;
      const atBottom =
        lenis.targetScroll >= lenis.limit - 1 &&
        lenis.animatedScroll >= lenis.limit - 2;
      const leavingAtTop = event.deltaY < 0 && atTop;
      const leavingAtBottom = event.deltaY > 0 && atBottom;

      if (!leavingAtTop && !leavingAtBottom) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      window.scrollBy({
        top: event.deltaY,
        left: 0,
        behavior: "auto",
      });
    };

    scroller.addEventListener("wheel", handleBoundaryWheel, {
      capture: true,
      passive: false,
    });
    lenis.on("scroll", handleScroll);
    lenisRef.current = lenis;

    const animate = (time: number) => {
      lenis.raf(time);
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
      lastTransformsRef.current.clear();
      updateCardTransforms();
    });
    resizeObserver.observe(scroller);
    cards.forEach((card) => resizeObserver.observe(card));

    animationFrameRef.current = window.requestAnimationFrame(animate);
    updateCardTransforms();

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      scroller.removeEventListener("wheel", handleBoundaryWheel, {
        capture: true,
      });
      lenis.destroy();
      lenisRef.current = null;
      cardsRef.current = [];
      lastTransformsRef.current.clear();
      isUpdatingRef.current = false;
    };
  }, [stackEnabled, updateCardTransforms]);

  return (
    <div
      className={`scroll-stack-scroller${stackEnabled ? " is-enabled" : ""}`}
      ref={scrollerRef}
      aria-label="Experience timeline"
      tabIndex={stackEnabled ? 0 : undefined}
    >
      <div className="scroll-stack-inner">
        {items.map((item) => (
          <div
            className="scroll-stack-card"
            key={item.company}
            style={
              {
                "--experience-color": item.color,
              } as CSSProperties
            }
            >
            <details className="experience-card">
              <summary
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  const details = event.currentTarget
                    .parentElement as HTMLDetailsElement;
                  details.open = !details.open;
                }}
              >
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
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    </div>
  );
}
