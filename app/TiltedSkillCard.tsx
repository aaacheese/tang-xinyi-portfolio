"use client";

import type { ReactNode, MouseEvent } from "react";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

type TiltedSkillCardProps = {
  children: ReactNode;
};

export default function TiltedSkillCard({
  children,
}: TiltedSkillCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  const canAnimate = () =>
    !shouldReduceMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !canAnimate()) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    rotateX.set((offsetY / (rect.height / 2)) * -12);
    rotateY.set((offsetX / (rect.width / 2)) * 12);
  };

  const handleMouseEnter = () => {
    if (!canAnimate()) return;
    scale.set(1.08);
  };

  const handleMouseLeave = () => {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      className="skill-tilt-shell"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.article
        className="skill-tilt-card"
        style={{ rotateX, rotateY, scale }}
      >
        {children}
      </motion.article>
    </div>
  );
}
