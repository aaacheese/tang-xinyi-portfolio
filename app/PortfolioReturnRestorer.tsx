"use client";

import { useEffect } from "react";
import {
  clearPortfolioReturnState,
  readPortfolioReturnState,
} from "./portfolioReturnState";

export default function PortfolioReturnRestorer() {
  useEffect(() => {
    const state = readPortfolioReturnState();
    if (!state?.restoreRequested) return;

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const section = document.getElementById(state.section);
        if (!section) {
          clearPortfolioReturnState();
          return;
        }

        const sectionTop =
          window.scrollY + section.getBoundingClientRect().top;
        const maxScroll = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          0,
        );
        const target = Math.min(
          maxScroll,
          Math.max(0, sectionTop + state.sectionOffset),
        );

        window.scrollTo({ top: target, behavior: "auto" });

        if (state.section === "experience") {
          clearPortfolioReturnState();
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return null;
}
