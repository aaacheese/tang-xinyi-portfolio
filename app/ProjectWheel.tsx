"use client";

import { useEffect, useRef } from "react";

type ProjectItem = {
  id: string;
  imageSrc?: string;
  alt?: string;
};

type ProjectWheelProps = {
  items?: ProjectItem[];
};

const BASE_PROJECTS: ProjectItem[] = Array.from({ length: 9 }, (_, index) => ({
  id: `project-${index + 1}`,
}));

export default function ProjectWheel({
  items = BASE_PROJECTS,
}: ProjectWheelProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const wheelItems = [...items, ...items].map((item, index) => ({
    ...item,
    instanceId: `${item.id}-${index < items.length ? "a" : "b"}`,
  }));

  useEffect(() => {
    let disposed = false;
    let observer: IntersectionObserver | null = null;
    let timeline: import("gsap").gsap.core.Timeline | null = null;
    let draggableInstance: { kill: () => void } | null = null;

    const setup = async () => {
      const [{ gsap }, { Draggable }] = await Promise.all([
        import("gsap"),
        import("gsap/Draggable"),
      ]);

      if (disposed || !sectionRef.current || !wheelRef.current) return;

      gsap.registerPlugin(Draggable);

      const cards = itemRefs.current.filter(
        (item): item is HTMLDivElement => item !== null,
      );
      const total = cards.length;
      const degree = 360 / total;
      const wheel = wheelRef.current;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const settleCards = () => {
        cards.forEach((card, index) => {
          const rotationAngle = index * degree;
          gsap.set(card, {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            transformOrigin: "center 200vh",
            rotation:
              index > total / 2
                ? -degree * (total - index)
                : rotationAngle,
          });
        });
      };

      const playEntrance = () => {
        if (timeline || disposed) return;

        timeline = gsap.timeline();
        const unfoldAt = 0.15 * (total / 2 - 1) + 1;

        cards.forEach((card, index) => {
          const sign = Math.floor((index / 2) % 2) ? 1 : -1;
          const value = Math.floor((index + 4) / 4) * 4;
          const restingRotation = index > total - 3 ? 0 : sign * value;

          gsap.set(card, {
            rotation: restingRotation,
            scale: 0.5,
            opacity: 1,
          });

          timeline!.from(
            card,
            {
              x: () =>
                index % 2
                  ? window.innerWidth + card.clientWidth * 4
                  : -window.innerWidth - card.clientWidth * 4,
              y: () => window.innerHeight - card.clientHeight,
              rotation: index % 2 ? 200 : -200,
              scale: 4,
              opacity: 1,
              ease: "power4.out",
              duration: 1,
              delay: 0.15 * Math.floor(index / 2),
            },
            0,
          );

          timeline!.to(card, { scale: 1, duration: 0 }, unfoldAt);
          timeline!.to(
            card,
            {
              transformOrigin: "center 200vh",
              rotation:
                index > total / 2
                  ? -degree * (total - index)
                  : index * degree,
              duration: 1,
              ease: "power1.out",
            },
            unfoldAt,
          );
        });
      };

      gsap.set(cards, { opacity: 0 });

      if (prefersReducedMotion) {
        settleCards();
      } else {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            playEntrance();
            observer?.disconnect();
            observer = null;
          },
          { threshold: 0.25 },
        );
        observer.observe(sectionRef.current);
      }

      const [instance] = Draggable.create(wheel, {
        type: "rotation",
        trigger: cards,
        onDragStart() {
          this.startRotation = this.rotation;
        },
        onDragEnd() {
          const start = this.startRotation ?? 0;
          const rotation = this.rotation;
          const offset = Math.abs(rotation - start);

          if (rotation > start) {
            gsap.to(wheel, {
              rotation:
                rotation - start < degree / 2
                  ? `-=${offset}`
                  : `+=${2 * degree - offset}`,
              duration: 0.45,
              ease: "power2.out",
            });
          } else {
            gsap.to(wheel, {
              rotation:
                Math.abs(rotation - start) < degree / 2
                  ? `+=${offset}`
                  : `-=${2 * degree - offset}`,
              duration: 0.45,
              ease: "power2.out",
            });
          }
        },
      });

      draggableInstance = instance;
    };

    void setup();

    return () => {
      disposed = true;
      observer?.disconnect();
      timeline?.kill();
      draggableInstance?.kill();
    };
  }, []);

  const rotateWithKeyboard = (direction: 1 | -1) => {
    void import("gsap").then(({ gsap }) => {
      if (!wheelRef.current) return;
      const degree = 360 / wheelItems.length;
      gsap.to(wheelRef.current, {
        rotation: `${direction > 0 ? "+=" : "-="}${degree * 2}`,
        duration: 0.45,
        ease: "power2.out",
      });
    });
  };

  return (
    <div
      className="project-wheel-container"
      ref={sectionRef}
      role="region"
      aria-label="Draggable projects gallery"
    >
      <div className="project-wheel-center">
        <div
          className="project-wheel-items"
          ref={wheelRef}
          role="group"
          aria-label="Drag the project cards to rotate the gallery"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              rotateWithKeyboard(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              rotateWithKeyboard(1);
            }
          }}
        >
          {wheelItems.map((item, index) => (
            <div
              className="project-wheel-item"
              key={item.instanceId}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              aria-hidden="true"
            >
              <div className="project-wheel-card">
                {item.imageSrc ? (
                  <img
                    className="project-wheel-image"
                    src={item.imageSrc}
                    alt={item.alt ?? ""}
                    draggable={false}
                  />
                ) : (
                  <div className="project-wheel-placeholder" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="project-wheel-hint" aria-hidden="true">
        Drag to explore
      </p>
    </div>
  );
}
