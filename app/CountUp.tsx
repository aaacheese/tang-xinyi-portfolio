"use client";

import { useInView, useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

type CountUpProps = {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
};

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);
  const springValue = useSpring(motionValue, {
    damping: 28,
    stiffness: 170,
    mass: 0.8,
  });
  const isInView = useInView(ref, { once: false, margin: "0px" });

  const getDecimalPlaces = (value: number) => {
    const decimals = value.toString().split(".")[1];
    return decimals && Number.parseInt(decimals, 10) !== 0
      ? decimals.length
      : 0;
  };

  const maxDecimals = Math.max(
    getDecimalPlaces(from),
    getDecimalPlaces(to),
  );

  const formatValue = useCallback(
    (latest: number) => {
      const formattedNumber = Intl.NumberFormat("en-US", {
        useGrouping: Boolean(separator),
        minimumFractionDigits: maxDecimals,
        maximumFractionDigits: maxDecimals,
      }).format(latest);

      return separator
        ? formattedNumber.replace(/,/g, separator)
        : formattedNumber;
    },
    [maxDecimals, separator],
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(
        direction === "down" ? to : from,
      );
    }
  }, [direction, formatValue, from, to]);

  useEffect(() => {
    const initialValue = direction === "down" ? to : from;
    const targetValue = direction === "down" ? from : to;

    if (!isInView || !startWhen) {
      motionValue.jump(initialValue);
      springValue.jump(initialValue);

      if (ref.current) {
        ref.current.textContent = formatValue(initialValue);
      }

      return;
    }

    onStart?.();
    const startTimer = window.setTimeout(() => {
      motionValue.set(targetValue);
    }, delay * 1000);
    const endTimer = window.setTimeout(
      () => onEnd?.(),
      (delay + duration) * 1000,
    );

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, [
    delay,
    direction,
    duration,
    from,
    formatValue,
    isInView,
    motionValue,
    onEnd,
    onStart,
    springValue,
    startWhen,
    to,
  ]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = formatValue(latest);
        }
      }),
    [formatValue, springValue],
  );

  return <span className={className} ref={ref} />;
}
