"use client";

import { useLayoutEffect } from "react";
import {
  clearPortfolioReturnState,
  readPortfolioReturnState,
} from "./portfolioReturnState";

export default function PortfolioReturnRestorer() {
  useLayoutEffect(() => {
    const revealPage = () => {
      document.documentElement.removeAttribute("data-portfolio-restoring");
      document.documentElement.style.removeProperty("scroll-behavior");
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      clearPortfolioReturnState();
      revealPage();
    };

    window.addEventListener("pageshow", handlePageShow);

    const state = readPortfolioReturnState();
    if (!state?.restoreRequested) {
      revealPage();
      return () => window.removeEventListener("pageshow", handlePageShow);
    }

    const section = document.getElementById(state.section);
    if (!section) {
      clearPortfolioReturnState();
      revealPage();
      return () => window.removeEventListener("pageshow", handlePageShow);
    }

    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
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

    revealPage();

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return null;
}
