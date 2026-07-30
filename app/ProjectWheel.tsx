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

const BASE_PROJECTS: ProjectItem[] = [
  {
    id: "project-01",
    imageSrc: "/assets/projects/01.png",
    alt: "熊猫选娃 AI 智能识别挑选孩子照片项目",
  },
  {
    id: "project-02",
    imageSrc: "/assets/projects/02.png",
    alt: "习惯猫儿童行为习惯培养平台设计",
  },
  {
    id: "project-03",
    imageSrc: "/assets/projects/03.png",
    alt: "AA班级助手教师班级管理产品",
  },
  {
    id: "project-04",
    imageSrc: "/assets/projects/04.png",
    alt: "春风好轻松宣健共创市集视觉设计",
  },
  {
    id: "project-05",
    imageSrc: "/assets/projects/05.png",
    alt: "挥毫落纸智能书法辅助工具",
  },
  {
    id: "project-06",
    imageSrc: "/assets/projects/06.png",
    alt: "华帝智能烹饪产品界面设计",
  },
  {
    id: "project-07",
    imageSrc: "/assets/projects/07.png",
    alt: "Janor's Shop 童趣商店三维场景设计",
  },
  {
    id: "project-08",
    imageSrc: "/assets/projects/08.png",
    alt: "智愈奇旅儿童人体器官科普游戏",
  },
  {
    id: "project-09",
    imageSrc: "/assets/projects/09.png",
    alt: "文洪机械产品视觉展示设计",
  },
  {
    id: "project-10",
    imageSrc: "/assets/projects/10.png",
    alt: "智能制冷保鲜加热餐吧产品设计",
  },
  {
    id: "project-11",
    imageSrc: "/assets/projects/11.png",
    alt: "春风好轻松音乐主题品牌视觉设计",
  },
  {
    id: "project-12",
    imageSrc: "/assets/projects/12.png",
    alt: "Hisense 智能设备概念设计",
  },
  {
    id: "project-13",
    imageSrc: "/assets/projects/13.png",
    alt: "Body Quest 儿童科普角色插画",
  },
  {
    id: "project-14",
    imageSrc: "/assets/projects/14.png",
    alt: "Monday Canteen 双代际城市移民服务系统设计",
  },
  {
    id: "project-15",
    imageSrc: "/assets/projects/15.png",
    alt: "Talk Horn 特殊扩音器产品设计",
  },
  {
    id: "project-16",
    imageSrc: "/assets/projects/16.png",
    alt: "Hisense 智能设备外观设计",
  },
  {
    id: "project-17",
    imageSrc: "/assets/projects/17.png",
    alt: "智愈奇旅水下场景插画",
  },
  {
    id: "project-18",
    imageSrc: "/assets/projects/18.png",
    alt: "智能摄像设备工业设计",
  },
];

export default function ProjectWheel({
  items = BASE_PROJECTS,
}: ProjectWheelProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const wheelItems =
    items.length > 1 ? [...items.slice(1), items[0]] : items;

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
            transformOrigin: "center 180vh",
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
              transformOrigin: "center 180vh",
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
          role="list"
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
              key={item.id}
              role="listitem"
              data-project-number={item.id.replace("project-", "")}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
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
