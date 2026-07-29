"use client";

import { useEffect } from "react";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotation: number;
};

export default function StoryMotion() {
  useEffect(() => {
    const storySequence =
      document.querySelector<HTMLElement>(".story-sequence");
    const visual = document.querySelector<HTMLElement>(".story-visual");
    const card = document.querySelector<HTMLElement>(".story-card");
    const heroFace = document.querySelector<HTMLElement>(".story-hero");
    const contentsFace =
      document.querySelector<HTMLElement>(".story-contents");
    const aboutFace = document.querySelector<HTMLElement>(".story-about");
    const heroSection = document.querySelector<HTMLElement>(".hero");
    const contentsSection = document.querySelector<HTMLElement>(".contents");
    const aboutSection = document.querySelector<HTMLElement>(".about");
    const heroAnchor =
      document.querySelector<HTMLElement>(".story-anchor-hero");
    const contentsAnchor = document.querySelector<HTMLElement>(
      ".story-anchor-contents",
    );
    const aboutAnchor =
      document.querySelector<HTMLElement>(".story-anchor-about");
    const aboutLabelAnchor = document.querySelector<HTMLElement>(
      ".story-anchor-about-label",
    );
    const aboutLabel =
      document.querySelector<HTMLElement>(".story-about-label");

    if (
      !storySequence ||
      !visual ||
      !card ||
      !heroFace ||
      !contentsFace ||
      !aboutFace ||
      !heroSection ||
      !contentsSection ||
      !aboutSection ||
      !heroAnchor ||
      !contentsAnchor ||
      !aboutAnchor ||
      !aboutLabelAnchor ||
      !aboutLabel
    ) {
      return;
    }

    let animationFrame = 0;
    let hero: Frame;
    let contents: Frame;
    let about: Frame;
    let lockedAbout: Frame;
    let portraitLocked = false;
    let aboutLabelX = 0;
    let aboutLabelY = 0;
    let aboutLabelScale = 1;
    let contentsStart = 1;
    let aboutStart = 2;
    let aboutArrival = 2;
    let aboutSequenceTop = 0;

    const measure = (
      anchor: HTMLElement,
      section: HTMLElement,
      radius: number,
      rotation: number,
    ): Frame => {
      const anchorRect = anchor.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      return {
        x: anchorRect.left,
        y: anchorRect.top - sectionRect.top,
        width: anchorRect.width,
        height: anchorRect.height,
        radius,
        rotation,
      };
    };

    const measureAll = () => {
      hero = measure(heroAnchor, heroSection, 30, -6.79);
      contents = measure(contentsAnchor, contentsSection, 30, 4.51);
      about = measure(aboutAnchor, aboutSection, 0, 0);

      // CSS physical units are defined against 96px per inch. Apply the
      // requested desktop offsets after measurement so parent scaling does not
      // magnify the final centimeter-based adjustments.
      const pixelsPerCentimeter = 96 / 2.54;
      const isDesktop = window.innerWidth > 760;
      const aboutOffsetX = isDesktop ? 2 * pixelsPerCentimeter : 0;
      const aboutOffsetY = isDesktop ? 5 * pixelsPerCentimeter : 0;
      about.x -= aboutOffsetX;
      about.y -= aboutOffsetY;
      lockedAbout = { ...about };
      portraitLocked = false;
      const aboutLabelRect = aboutLabelAnchor.getBoundingClientRect();
      const aboutSectionRect = aboutSection.getBoundingClientRect();
      const aboutLabelOffsetX = isDesktop
        ? 1 * pixelsPerCentimeter
        : 0;
      const aboutLabelOffsetY = isDesktop
        ? 1 * pixelsPerCentimeter
        : 0;
      aboutLabelX = aboutLabelRect.left - aboutLabelOffsetX;
      aboutLabelY =
        aboutLabelRect.top - aboutSectionRect.top - aboutLabelOffsetY;
      aboutLabelScale = aboutLabelRect.width / 208;
      const storySequenceTop =
        window.scrollY + storySequence.getBoundingClientRect().top;
      contentsStart =
        window.scrollY + contentsSection.getBoundingClientRect().top;
      aboutStart =
        window.scrollY + aboutSection.getBoundingClientRect().top;
      aboutSequenceTop = aboutStart - storySequenceTop;
      // Match Portavia's sticky-track behavior: finish the second transition
      // before the next section begins, then clamp the card to its final frame.
      aboutArrival =
        contentsStart + (aboutStart - contentsStart) * 0.82;
    };

    const mixFrame = (from: Frame, to: Frame, progress: number): Frame => ({
      x: lerp(from.x, to.x, progress),
      y: lerp(from.y, to.y, progress),
      width: lerp(from.width, to.width, progress),
      height: lerp(from.height, to.height, progress),
      radius: lerp(from.radius, to.radius, progress),
      rotation: lerp(from.rotation, to.rotation, progress),
    });

    const render = () => {
      const scroll = window.scrollY;
      const firstProgress = smoothstep(scroll / contentsStart);
      const hasArrived = scroll >= aboutArrival;
      const secondProgress = hasArrived
        ? 1
        : smoothstep(
            (scroll - contentsStart) / (aboutArrival - contentsStart),
          );
      const inSecondTransition = scroll >= contentsStart;
      const progress = inSecondTransition ? secondProgress : firstProgress;
      const frame = hasArrived
        ? lockedAbout
        : inSecondTransition
        ? mixFrame(contents, about, progress)
        : mixFrame(hero, contents, progress);
      const angle = hasArrived
        ? 360
        : inSecondTransition
        ? lerp(180, 360, progress)
        : lerp(0, 180, progress);
      const scale = hasArrived
        ? 1
        : 1 - 0.084 * Math.sin(Math.PI * progress);
      const tilt = hasArrived
        ? about.rotation
        : frame.rotation + 5.5 * Math.sin(Math.PI * progress);
      const labelProgress = smoothstep(
        (scroll - aboutArrival) /
          Math.max(aboutStart - aboutArrival, 1),
      );
      const releasedToAbout = scroll >= aboutStart;

      visual.style.position = releasedToAbout ? "absolute" : "fixed";
      visual.style.top = releasedToAbout ? `${aboutSequenceTop}px` : "0";
      visual.style.left = "0";
      visual.style.right = "0";
      visual.style.width = "100%";
      card.style.position = "absolute";

      if (!hasArrived) {
        portraitLocked = false;
      }

      // Apply the screenshot-matched final frame once. Subsequent scroll
      // events may change visibility, but never rewrite portrait geometry.
      if (!portraitLocked) {
        card.style.left = `${frame.x}px`;
        card.style.top = `${frame.y}px`;
        card.style.width = `${frame.width}px`;
        card.style.height = `${frame.height}px`;
        card.style.borderRadius = `${frame.radius}px`;
        card.style.transform = `perspective(1200px) scale(${scale}) rotate(${tilt}deg) rotateY(${angle}deg)`;
        portraitLocked = hasArrived;
      }

      card.style.opacity = "1";
      aboutLabel.style.left = `${aboutLabelX}px`;
      aboutLabel.style.top = `${aboutLabelY}px`;
      aboutLabel.style.opacity = `${labelProgress}`;
      aboutLabel.style.transform = `translateY(${
        (1 - labelProgress) * 8
      }px) scale(${aboutLabelScale}) scaleX(${labelProgress})`;

      if (angle <= 180) {
        const swap = smoothstep((angle - 80) / 20);
        heroFace.style.opacity = `${1 - swap}`;
        contentsFace.style.opacity = `${swap}`;
        aboutFace.style.opacity = "0";
      } else {
        const swap = smoothstep((angle - 260) / 20);
        heroFace.style.opacity = "0";
        contentsFace.style.opacity = `${1 - swap}`;
        aboutFace.style.opacity = `${swap}`;
      }
    };

    const requestRender = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(render);
    };

    const handleResize = () => {
      measureAll();
      requestRender();
    };

    measureAll();
    render();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return null;
}
