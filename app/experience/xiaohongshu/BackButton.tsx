"use client";

import { requestPortfolioRestore } from "../../portfolioReturnState";
import type { MouseEvent } from "react";

type BackButtonProps = {
  className: string;
  fallbackHref?: string;
};

export default function BackButton({
  className,
  fallbackHref = "/#experience",
}: BackButtonProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const shouldRestore = requestPortfolioRestore(
      window.location.pathname,
    );
    if (!shouldRestore) return;

    event.preventDefault();

    const fallbackUrl = fallbackHref.split("#")[0] || "/";
    let fallbackTimer = 0;

    const cancelFallback = () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("pagehide", cancelFallback);
    };

    window.addEventListener("pagehide", cancelFallback, { once: true });
    fallbackTimer = window.setTimeout(() => {
      cancelFallback();
      window.location.replace(fallbackUrl);
    }, 800);

    window.history.back();
  };

  return (
    <a
      className={className}
      href={fallbackHref}
      onClick={handleClick}
    >
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </a>
  );
}
